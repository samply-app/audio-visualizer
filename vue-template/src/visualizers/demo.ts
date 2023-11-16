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

function drawWaveform(context: CanvasRenderingContext2D, time: Uint8Array){
  const { width, height } = context.canvas;

  context.lineWidth = 2;
  context.strokeStyle = 'rgb(255, 255, 255)';

  const sliceWidth = width / time.length;
  let x = 0;
  context.beginPath();
  for(var i = 0; i < time.length; i++) {
    const v = time[i]/128.0;
    const y = v * height/2;

    if(i === 0)
      context.moveTo(x, y);
    else
      context.lineTo(x, y);

    x += sliceWidth;
  }

  context.lineTo(width, height/2);
  context.stroke();
}

const demo: Program = {
  contextId: '2d',
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  frameHandler(context: CanvasRenderingContext2D, frequency: Uint8Array, time: Uint8Array, deltaTime: number, deltaFrames: number) {
    const { width, height } = context.canvas;
    drawSpectrogram(context, frequency);
    drawWaveform(context, time);
  }
}

export default demo;