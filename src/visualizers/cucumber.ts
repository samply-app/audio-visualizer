import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from '../useVisualizer';

const GATE_MAX_ENERGY = 0.5;
const GATE_SPEED = 1 / 10000;

let gateIncreasing = true;
let gateEnergy = 0;
let startingHue = 0;
let rotationAngle = 0;
const spectralRange = 30; // 60 degrees from the anchor
const rotationSpeed = 0.00005; // 5 radians per-second

function frameHandler(context: CanvasRenderingContext2D, frequency: Uint8Array, time: Uint8Array, deltaTime: number, deltaFrames: number) {

  function drawBars(samples: Uint8Array, hueBase: number, gateEnergy: number, reversed?: true) {
    const { width, height } = context.canvas;
    const barWidth = width / samples.length;

    for (let i = 0; i < samples.length; i += 1) {

      const energyNormalized = samples[reversed ? samples.length - i - 1 : i] / AMPLITUDE_FREQUENCY;

      const saturation = '50%'
      const lumanice = `${Math.max(Math.floor(energyNormalized * 75), gateEnergy)}%`
      const hueOffset = energyNormalized - 0.5; // shift to [-0.5, 0.5]     
      const hue = Math.floor(hueBase + hueOffset * spectralRange);

      const barHeight = Math.hypot(height, width);

      const xPos = i * barWidth;
      const yPos = -((barHeight - height) / 2);

      if (energyNormalized > gateEnergy) {
        context.fillStyle = 'hsla(' + hue + ',' + saturation + ',' + lumanice + ', ' + energyNormalized + ')';
        context.fillRect(xPos, yPos, barWidth, barHeight);
      }
    }

  }

  const { width, height } = context.canvas;
  const frequencyCropped = frequency.slice(0, Math.floor(frequency.length * 0.7))

  // transform canvas for bars
  context.translate(width / 2, height / 2)
  context.rotate(rotationAngle);
  context.translate(-width / 2, -height / 2)

  drawBars(frequencyCropped, startingHue, gateEnergy);
  drawBars(frequencyCropped, startingHue + spectralRange, gateEnergy, true);

  // update accumulators
  startingHue += 1 / 25;
  rotationAngle += rotationSpeed * deltaTime;


  if (gateIncreasing) {
    gateEnergy += deltaTime * GATE_SPEED;
  } else {
    gateEnergy -= deltaTime * GATE_SPEED;
  }

  if (gateIncreasing && gateEnergy > GATE_MAX_ENERGY) gateIncreasing = false;
  if (!gateIncreasing && gateEnergy < 0) gateIncreasing = true;


}

const cucumber: Program = {
  contextId: '2d',
  fftSize: 2048,
  smoothingTimeConstant: 0.95,
  frameHandler,
}

export default cucumber;