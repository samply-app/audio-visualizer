import { Program } from '../useVisualizer';

function drawOverlays(context: CanvasRenderingContext2D, width: number, height: number) {
  const RECT_SIZE = 25;

  context.fillStyle = 'rgba(255, 255, 255, 0.5)';
  context.strokeStyle = 'white';
  context.lineWidth = 0;

  // TOP LEFT
  context.beginPath();
  context.fillRect(0, 0, RECT_SIZE, RECT_SIZE);
  // TOP RIGHT
  context.beginPath();
  context.fillRect(width - RECT_SIZE - 0, 0, RECT_SIZE, RECT_SIZE);
  // BOTTOM RIGHT
  context.beginPath();
  context.fillRect(width - RECT_SIZE - 0, height - RECT_SIZE - 0, RECT_SIZE, RECT_SIZE);
  // BOTTOM LEFT
  context.beginPath();
  context.fillRect(0, height - RECT_SIZE - 0, RECT_SIZE, RECT_SIZE);
}

const helloworld: Program = {
  contextId: '2d',
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  frameHandler(context: CanvasRenderingContext2D, delta: number, fft: Uint8Array, frequencyBinCount: number) {
    const { width, height } = context.canvas;

    const barWidth = (width / frequencyBinCount) * 2.5;
    let barHeight;
    let x = 0;

    for (var i = 0; i < frequencyBinCount; i++) {
      barHeight = (fft[i] / 255) * height;
      context.fillStyle = `rgba(255,50,50, ${(barHeight / height)})`;
      context.fillRect(x, height - barHeight, barWidth, (barHeight/2));
      x += barWidth + 1;
    }
    drawOverlays(context, width, height);
  }
}

export default helloworld;