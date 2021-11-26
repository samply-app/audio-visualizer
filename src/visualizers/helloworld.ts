let position = 0;

export default function animateFrame(context: CanvasRenderingContext2D, delta: number, fft: Uint8Array) {
  context.clearRect(0, 0, 1000, 1000);

  context.fillStyle = 'green';
  for (let i = 0; i < fft.length; i += 1) {
    context.beginPath();
    context.rect(i, 0, 1, fft[i] / 4);
    context.fill();
  }
}