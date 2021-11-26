import { onMounted, onUnmounted, Ref } from 'vue';

// TODO: Inject via composition invocation
import helloworld from './visualizers/helloworld';

interface Program {
  /** The type of drawing context */
  contextId: '2d',
  fftSize: 1024,
}

const FRAME_DURATION = 1000 / 60; // 60fps frame duration ~16.66ms

const getTime = (performance && performance.now) ? performance.now.bind(performance) : Date.now; // If available we are using native "performance" API instead of "Date"

export default function useVisualizer(
  _canvas?: Ref<HTMLCanvasElement | undefined>
) {

  let canvas: HTMLCanvasElement;
  let canvasContext: CanvasRenderingContext2D;

  let audioContext: AudioContext;
  let audioAnalyzer: AnalyserNode;
  let audioDataArray: Uint8Array;

  let frameHandler: number;
  let timePrevious = getTime();

  function main() {
    const timeNow = getTime();
    const deltaMilliseconds = timeNow - timePrevious;
    const deltaFrames = deltaMilliseconds / FRAME_DURATION;

    // Update audio data
    audioAnalyzer.getByteFrequencyData(audioDataArray);

    // ANIMATE START
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to retrieve context')
    helloworld(ctx, deltaFrames, audioDataArray);
    // ANIMATE END

    timePrevious = timeNow;
    frameHandler = requestAnimationFrame(main)
  }

  /**
   * Kick off the visualization animation loop.
   * Must be called after the `onMounted` hook fires.
   */
  function start(opts: { fullscreen: boolean }) {
    frameHandler = requestAnimationFrame(main);
    if (opts.fullscreen) canvas.requestFullscreen();
  }

  function attachAudio(audio: HTMLAudioElement){
    audioContext = new AudioContext();
    audioAnalyzer = audioContext.createAnalyser();
    audioAnalyzer.smoothingTimeConstant = 0.3;
    audioAnalyzer.fftSize = 1024;

    audioDataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
    audioAnalyzer.getByteFrequencyData(audioDataArray);

    // Connect to audio node    
    const sourceNode = audioContext.createMediaElementSource(audio);
    sourceNode.connect(audioAnalyzer);
    sourceNode.connect(audioContext.destination);
  }

  onMounted(() => {
    if (!_canvas?.value) console.warn('Creating custom canvas');
    canvas = _canvas?.value ?? document.createElement("canvas");

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to retrieve context from canvas.');
    canvasContext = ctx;

  });

  onUnmounted(() => {
    cancelAnimationFrame(frameHandler ?? -1);
  });

  return {
    start,
    attachAudio
  }
}