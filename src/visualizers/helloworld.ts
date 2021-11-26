import { scaleCanvas, Program } from '../useVisualizer';

function drawOverlays(context: CanvasRenderingContext2D, width: number, height: number) {
  const RECT_SIZE = 25;
  const RECT_STROKE_WIDTH = 4;

  context.strokeStyle = 'gray';
  context.lineWidth = RECT_STROKE_WIDTH;

  // TOP LEFT
  context.beginPath();
  context.strokeRect(RECT_STROKE_WIDTH, RECT_STROKE_WIDTH, RECT_SIZE, RECT_SIZE);
  // TOP RIGHT
  context.beginPath();
  context.strokeRect(width - RECT_SIZE - RECT_STROKE_WIDTH, RECT_STROKE_WIDTH, RECT_SIZE, RECT_SIZE);
  // BOTTOM RIGHT
  context.beginPath();
  context.strokeRect(width - RECT_SIZE - RECT_STROKE_WIDTH, height - RECT_SIZE - RECT_STROKE_WIDTH, RECT_SIZE, RECT_SIZE);
  // BOTTOM LEFT
  context.beginPath();
  context.strokeRect(RECT_STROKE_WIDTH, height - RECT_SIZE - RECT_STROKE_WIDTH, RECT_SIZE, RECT_SIZE);
}

const helloworld: Program = {
  contextId: '2d',
  fftSize: 256,
  smoothingTimeConstant: 0.9,
  frameHandler(context: CanvasRenderingContext2D, delta: number, fft: Uint8Array, frequencyBinCount: number) {
    const { width, height } = scaleCanvas(context.canvas);
    drawOverlays(context, width, height);

    const barWidth = (width / frequencyBinCount) * 2.5;
    let barHeight;
    let x = 0;

    for (var i = 0; i < frequencyBinCount; i++) {
      barHeight = (fft[i] / 255 / 2) * height;
      context.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      context.fillRect(x, height - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }
  }
}

export default helloworld;