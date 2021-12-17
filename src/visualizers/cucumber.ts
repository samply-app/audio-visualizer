import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from '../useVisualizer';

const GATE_MAX_ENERGY = 0.5;
const GATE_SPEED = 1 / 100000;

let lowpassCutoff = 1; // no cutoff, use 100% of available frequencies 
let gateIncreasing = true;
let startingHue = 0;
let rotationAngle = 0;
const spectralRange = 30; // 60 degrees from the anchor
const rotationSpeed = 0.00005; // 5 radians per-secon

function createBall(ctx: CanvasRenderingContext2D, x: number, y: number){
  let verticalOffset = 0;
  let horizontalOffset = 0;

  return function (samples: Uint8Array, deltaFrames: number) {
    const radius = 16;
    verticalOffset += 1 * deltaFrames; // 1px/frame
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
  }
}

let ball1: Function;

function init(context: CanvasRenderingContext2D) {
  ball1 = createBall(context, 100, 100);
  console.log(ball1);
  
}

function frameHandler(context: CanvasRenderingContext2D, frequency: Uint8Array, time: Uint8Array, deltaTime: number, deltaFrames: number) {  

  function drawBars(samples: Uint8Array, hueBase: number, reversed?: true) {    
    const scaleFactor = 2;
    const width = context.canvas.width * scaleFactor;
    const xOffset = -1 * (width - (width / scaleFactor)) / 2;
    const height = context.canvas.height * scaleFactor;
    const yOffset = -1 * (height - (height / scaleFactor)) / 2;
    
    const barWidth = width / samples.length;
    const barHeight = height;

    for (let i = 0; i < samples.length; i += 1) {

      const energyNormalized = samples[reversed ? samples.length - i - 1 : i] / AMPLITUDE_FREQUENCY;

      const saturation = '50%'
      const lumanice = `${Math.max(Math.floor(energyNormalized * 75), energyNormalized * 100)}%`
      const hueOffset = energyNormalized - 0.5; // shift to [-0.5, 0.5]     
      const hue = Math.floor(hueBase + hueOffset * spectralRange);

      const xPos = i * barWidth + xOffset;
      const yPos = -((barHeight - height) / 2) + yOffset;

        context.fillStyle = 'hsla(' + hue + ',' + saturation + ',' + lumanice + ', ' + energyNormalized + ')';
        context.fillRect(xPos, yPos, barWidth, barHeight);
    }

    // Balls
    context.resetTransform();
    // ball1(time, deltaFrames);
  }


  const { width, height } = context.canvas;
  const frequencyCropped = frequency //frequency.slice(0, Math.floor(frequency.length * lowpassCutoff))

  // transform canvas for bars
  context.translate(width / 2, height / 2)
  context.rotate(rotationAngle);
  context.translate(-width / 2, -height / 2)

  drawBars(frequencyCropped, startingHue);
  drawBars(frequencyCropped, startingHue + spectralRange, true);

  // update accumulators
  startingHue += 1 / 25;
  rotationAngle += rotationSpeed * deltaTime;


  // if (gateIncreasing) {
  //   gateEnergy += deltaTime * GATE_SPEED;
  // } else {
  //   gateEnergy -= deltaTime * GATE_SPEED;
  // }

  // if (gateIncreasing && gateEnergy > GATE_MAX_ENERGY) gateIncreasing = false;
  // if (!gateIncreasing && gateEnergy < 0) gateIncreasing = true;

  lowpassCutoff = lowpassCutoff < 0.2 ? 1 : lowpassCutoff - 0.001
}

const cucumber: Program = {
  contextId: '2d',
  fftSize: 32,
  smoothingTimeConstant: 0.9,
  init,
  frameHandler,
}

export default cucumber;