import { onMounted, onUnmounted, Ref } from 'vue';

export interface Program {
  /** The type of drawing context */
  contextId: '2d',
  fftSize?: number,
  /** Value between [0, 1] */
  smoothingTimeConstant?: number,
  frameHandler: (
    context: CanvasRenderingContext2D,
    delta: number,
    fft: Uint8Array,
    frequencyBinCount: number
  ) => void;
}

function updateCanvasContext(context: CanvasRenderingContext2D, opts: { clearFrame?: boolean }) {
  const canvas = context.canvas;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
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

  let isFullscreen = false;

  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;

  let audioContext: AudioContext;
  let audioAnalyzer: AnalyserNode;
  let fftDataArray: Uint8Array;


  let frameHandler: number;
  let timePrevious = getTime();

  function animate() {
    const timeNow = getTime();
    const deltaMilliseconds = timeNow - timePrevious;
    const deltaFrames = deltaMilliseconds / FRAME_DURATION;

    // Update audio data
    audioAnalyzer.getByteFrequencyData(fftDataArray);

    if (!canvasContext) throw new Error('Failed to retrieve context');
    updateCanvasContext(canvasContext, { clearFrame: true });
    program.frameHandler(canvasContext, deltaFrames, fftDataArray, audioAnalyzer.frequencyBinCount);

    timePrevious = timeNow;
    frameHandler = requestAnimationFrame(animate)
  }

  /**
   * Kick off the visualization animation loop.
   * Must be called after the `onMounted` hook fires.
   */
  function start() {
    frameHandler = requestAnimationFrame(animate);
  }

  function toggleFullscreen() {
    launchIntoFullscreen(canvas);
  }

  function attachAudio(audio: HTMLAudioElement) {
    audioContext = new AudioContext();
    audioAnalyzer = audioContext.createAnalyser();
    audioAnalyzer.smoothingTimeConstant = program.smoothingTimeConstant ?? 0.3;
    audioAnalyzer.fftSize = program.fftSize ?? 2048;

    fftDataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteFrequencyData(fftDataArray);

    // Connect to audio node    
    const sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(audioAnalyzer);
    sourceNode.connect(audioContext.destination);
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
    toggleFullscreen,
    attachAudio
  }
}