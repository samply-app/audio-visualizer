import { onMounted, onUnmounted, Ref } from 'vue';

export interface Program {
  /** The type of drawing context */
  contextId: '2d',
  fftSize?: number,
  /** Value between [0, 1] */
  smoothingTimeConstant?: number,
  frameHandler: (
    context: CanvasRenderingContext2D,    
    frequency: Uint8Array,
    time: Uint8Array,
    deltaTime: number,
    deltaFrames: number,
  ) => void;
}

export const AMPLITUDE_FREQUENCY = 255;
export const AMPLITUDE_TIME = 255;

function updateCanvasContext(context: CanvasRenderingContext2D, opts: { clearFrame?: boolean }) {
  const canvas = context.canvas;
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  if (opts.clearFrame) context.clearRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function launchIntoFullscreen(element: HTMLElement) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
    // @ts-ignore
  } else if (element.mozRequestFullScreen) {
    // @ts-ignore
    element.mozRequestFullScreen();
    // @ts-ignore
  } else if (element.webkitRequestFullscreen) {
    // @ts-ignore
    element.webkitRequestFullscreen();
    // @ts-ignore
  } else if (element.msRequestFullscreen) {
    // @ts-ignore
    element.msRequestFullscreen();
  }
}

const FRAME_DURATION = 1000 / 60; // 60fps frame duration ~16.66ms

const getTime = (performance && performance.now) ? performance.now.bind(performance) : Date.now; // If available we are using native "performance" API instead of "Date"

export default function useVisualizer(
  program: Program,
  _canvas?: Ref<HTMLCanvasElement | undefined>
) {

  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;

  let audioContext: BaseAudioContext;
  let audioAnalyzer: AnalyserNode;
  let frequencyDataArray: Uint8Array;
  let timeDataArray: Uint8Array;


  let frameHandler: number;
  let timePrevious = getTime();

  function animate() {
    const timeNow = getTime();
    const deltaMilliseconds = timeNow - timePrevious;
    const deltaFrames = deltaMilliseconds / FRAME_DURATION;

    // Update audio data
    audioAnalyzer.getByteFrequencyData(frequencyDataArray);
    audioAnalyzer.getByteTimeDomainData(timeDataArray);

    if (!canvasContext) throw new Error('Failed to retrieve context');
    updateCanvasContext(canvasContext, { clearFrame: true });
    program.frameHandler(canvasContext, frequencyDataArray, timeDataArray, deltaMilliseconds, deltaFrames);

    timePrevious = timeNow;
    frameHandler = requestAnimationFrame(animate)
  }

  function start() {
    frameHandler = requestAnimationFrame(animate);
  }

  function toggleFullscreen() {
    launchIntoFullscreen(canvas);
  }

  function connect(sourceNode: AudioNode) {
    audioContext = sourceNode.context;
    audioAnalyzer = audioContext.createAnalyser();
    audioAnalyzer.smoothingTimeConstant = program.smoothingTimeConstant ?? 0.3;
    audioAnalyzer.fftSize = program.fftSize ?? 2048;

    frequencyDataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
    timeDataArray = new Uint8Array(audioAnalyzer.fftSize);
    audioAnalyzer.getByteFrequencyData(frequencyDataArray);
    audioAnalyzer.getByteTimeDomainData(timeDataArray);

    sourceNode.context
    sourceNode.connect(audioAnalyzer);
    return audioAnalyzer;
  }



  onMounted(() => {
    if (!_canvas?.value) {
      console.warn('Creating hidden canvas');
      canvas = document.createElement("canvas");
      canvas.style.display = 'none'; // hide the canvas
      document.body.appendChild(canvas);
    } else {
      canvas = _canvas.value
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to retrieve context from canvas.');
    canvasContext = ctx;
    canvasContext.scale(devicePixelRatio, devicePixelRatio); // ensure all drawing operations are scaled
  });

  onUnmounted(() => {
    cancelAnimationFrame(frameHandler ?? -1);
  });

  return {
    start,    
    connect,
    toggleFullscreen,
  }
}