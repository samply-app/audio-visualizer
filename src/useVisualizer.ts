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

export function scaleCanvas(canvas: HTMLCanvasElement) {
  // get current size of the canvas
  const rect = canvas.getBoundingClientRect();
  // increase the actual size of our canvas
  canvas.width = rect.width * devicePixelRatio;
  canvas.height = rect.height * devicePixelRatio;

  // scale everything down using CSS
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  return {
    width: canvas.width,
    height: canvas.height
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

  let audioContext: AudioContext;
  let audioAnalyzer: AnalyserNode;
  let fftDataArray: Uint8Array;


  let frameHandler: number;
  let timePrevious = getTime();

  function main() {
    const timeNow = getTime();
    const deltaMilliseconds = timeNow - timePrevious;
    const deltaFrames = deltaMilliseconds / FRAME_DURATION;

    // Update audio data
    audioAnalyzer.getByteFrequencyData(fftDataArray);

    // ANIMATE START
    if (!canvasContext) throw new Error('Failed to retrieve context')
    program.frameHandler(canvasContext, deltaFrames, fftDataArray, audioAnalyzer.frequencyBinCount);
    // ANIMATE END

    timePrevious = timeNow;
    frameHandler = requestAnimationFrame(main)
  }

  /**
   * Kick off the visualization animation loop.
   * Must be called after the `onMounted` hook fires.
   */
  function start() {
    frameHandler = requestAnimationFrame(main);
  }

  function toggleFullscreen() {
    if (_canvas?.value) {
      throw new Error('Fullscreen for provided canvas not yet supported.')
    }
    if (canvas.requestFullscreen) canvas.requestFullscreen();
    else {
      console.warn('Fullscreen not supported yet for this browser.')
    }
  }

  function onFullscreenChange() {
    console.log('called');

    if (document.fullscreenElement) {
      canvas.hidden = false;
    } else {
      canvas.hidden = true;
    }
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
      canvas.hidden = true;
      document.body.appendChild(canvas);
      canvas.addEventListener('fullscreenchange', onFullscreenChange)
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