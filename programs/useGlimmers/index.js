import createGlimmer from "./createGlimmer.js";
import lerp from './lerp.js';
import useTransientDetector from "./useTransientDetector.js";
import useFrequencyUtils from "./useFrequencyUtils.js";

export default function useGlimmers(offsetX = 0, offsetY = 0, sampleRate) {
  const transientDetectorLow = useTransientDetector(1.5, 0.9, 0.99);
  const transientDetectorMid = useTransientDetector(4, 0.5, 0.99);
  const transientDetectorHigh = useTransientDetector(1.5, 0.9, 0.99);

  const frequencyUtils = useFrequencyUtils(sampleRate);

  let time = 0;
  const glimmers = [];

  const numberOfGlimmers = 400;

  const backgroundColor = { r: 6, g: 43, b: 65, a: 0.5 };
  const backgroundSmoothingFactor = 0.9;
  let backgroundAmplitude = 0;

  // Initialize glimmers
  for(let i = 0; i < numberOfGlimmers; i++) {
    const startColor = { r: 6, g: 43, b: 65, a: 0 }
    const endColor = { r: 186, g: 230, b: 253, a: lerp(1, 0.5, i / numberOfGlimmers)  }
    glimmers.push(createGlimmer(startColor, endColor));
  }

  function getPosition(index) {
    const t = Math.min(time / 10000, 1);    
    const angle = index / lerp(0.8, 0.99, t);
    const distance = 5;
    const x = Math.cos(angle) * index * distance;
    const y = Math.sin(angle) * index * distance;
    return { x, y };
  }


  function trigger() {
    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const delayFactor = 0.25;
      glimmer.trigger(i * delayFactor);
    }
  }

  function drawFrame(ctx, width, height, frequencyData) {   

    // Detect transients and trigger animations
    const lowTransient = transientDetectorLow.detect(frequencyUtils.getRange(frequencyData, 0, 100));
    if(lowTransient) trigger();

    const origin = { x: (width / 2) + offsetX, y: (height / 2) + offsetY };

    // Draw background
    const highFrequencies = frequencyUtils.getRange(frequencyData, 1000, 20000);
    const highFrequencyEnergy = highFrequencies.reduce((acc, val) => acc + val, 0) / highFrequencies.length;
    backgroundAmplitude = backgroundAmplitude * backgroundSmoothingFactor + (highFrequencyEnergy / 255) * (1 - backgroundSmoothingFactor);
    ctx.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a * backgroundAmplitude})`;
    ctx.fillRect(0, 0, width, height);

    // Draw glows
    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const { x: xFib, y: yFib } = getPosition(i);
      glimmer.setPosition(origin.x + xFib, origin.y + yFib);
      glimmer.drawGlow(ctx);
    }

    // Draw speculars
    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const { x: xFib, y: yFib } = getPosition(i);
      glimmer.setPosition(origin.x + xFib, origin.y + yFib);
      glimmer.drawSpecular(ctx);
      glimmer.update(); // Only update once
    }

    time += 1;
  };
  
  return {
    trigger,
    drawFrame,
  }
}