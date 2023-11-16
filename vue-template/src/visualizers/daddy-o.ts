import { Program } from '../useVisualizer';

let frameNumber = 0;

const daddy: Program = {
  contextId: '2d',
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  frameHandler(context: CanvasRenderingContext2D, delta: number, fft: Uint8Array, frequencyBinCount: number) {
    const { width, height } = context.canvas;

    frameNumber++;
    let position = frameNumber/10;
    position = Math.floor(position);

    const barWidth = (width / frequencyBinCount) * 2.5;
    let barHeight;
    let barNumber = (position %48);
    let x = barNumber * barWidth;

    barHeight = (fft[barNumber] / 255) * height;
    context.fillStyle = `rgba(50,255,50, 1)`;
    context.fillRect(x, height - barHeight, barWidth, (barWidth));
    
  }
}

export default daddy;