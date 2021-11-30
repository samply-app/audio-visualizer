import { Program } from '../useVisualizer';

function drawSpectrogram(context: CanvasRenderingContext2D, frequency: Uint8Array) {
  const { width, height } = context.canvas;
  const barWidth = (width / frequency.length) * 2;
  let barHeight;
  let x = 0;

  for (var i = 0; i < frequency.length; i++) {
    barHeight = (frequency[i] / 255) * height;
    context.fillStyle = `rgba(255,50,50, ${(barHeight / height)})`;
    context.fillRect(x, height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}

const cucumber: Program = {
  contextId: '2d',
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  frameHandler(context: CanvasRenderingContext2D, delta: number, frequency: Uint8Array, time: Uint8Array) {
    const { width, height } = context.canvas;
    drawSpectrogram(context, frequency);

  }
}

export default cucumber;