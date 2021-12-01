import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from '../useVisualizer';

let xVals = [200];
let yVals = [0];
let xthresh = 0.5;
let lineColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
let counter = 0;

function frameHandler(ctx: CanvasRenderingContext2D, frequency: Uint8Array, time: Uint8Array, deltaTime: number, deltaFrames: number) {
  const { width, height } = ctx.canvas;

  console.log("frame");
  counter++;

  ctx.fillStyle = "#000000";
  //ctx.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.lineWidth = frequency[400] / 4;
  ctx.strokeStyle = lineColor;
  ctx.moveTo(xVals[0], yVals[0]);

  for (let i = 0; i < xVals.length; i++) {
    ctx.lineTo(xVals[i], yVals[i]);
  }

  if (counter % 100 == 0) {
    lineColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
  }

  ctx.stroke();

  for (let i = 0; i < frequency[Math.floor(frequency.length / 5)]; i++) {
    let xInc = (Math.random() > 0.5) ? -1 : 1;
    let yInc = (Math.random() > 0.9) ? -1 : 1;
    xVals.push(xVals[xVals.length - 1] + xInc);
    yVals.push(yVals[yVals.length - 1] + yInc);
  }

  if (xVals.length > 1000) {
    xVals = [Math.random() * width];
    yVals = [0];
  }
}

const pickle: Program = {
  contextId: '2d',
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  frameHandler,
}

export default pickle;