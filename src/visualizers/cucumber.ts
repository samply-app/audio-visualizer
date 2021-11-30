import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from '../useVisualizer';

let startingHue = 0;
const spectralRange = 60; // 60 degrees from the anchor

let xOffset = 0;

function frameHandler(context: CanvasRenderingContext2D, frequency: Uint8Array, time: Uint8Array, deltaTime: number, deltaFrames: number) {
  const { width, height } = context.canvas;

  startingHue += 1 / 25;

  const numSamples = frequency.length;
  const horizontalBars = width;
  const sliceLength = numSamples / horizontalBars;
  const sliceWidth = width / horizontalBars;

  for (let i = 0; i < horizontalBars; i += 1) {
    const slice = frequency.slice(i * sliceLength, (i + 1) * sliceLength)
    const energy = slice.reduce((a, b) => a + b, 0) / slice.length;
    const energyNormalized = energy / AMPLITUDE_FREQUENCY;

    const hue = Math.floor(startingHue);
    const saturation = '50%'
    const lumanice = `${Math.floor(energyNormalized * 50) + 25}%`

    context.fillStyle = 'hsl(' + hue + ',' + saturation + ',' + lumanice + ')';
    context.fillRect(i * sliceWidth , 0, (sliceWidth + 1), height);
  }

}

const cucumber: Program = {
  contextId: '2d',
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  frameHandler,
}

export default cucumber;