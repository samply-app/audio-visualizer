import createGlimmer from "./createGlimmer.js";
import lerp, { lerpColor, ease } from './lerp.js';
import useTransientDetector from "./useTransientDetector.js";
import useFrequencyUtils from "./useFrequencyUtils.js";

export default function useGlimmers(offsetX = 0, offsetY = 0, sampleRate) {
  const frequencyUtils = useFrequencyUtils(sampleRate);
  const transientDetectorLow = useTransientDetector(1.5, 0.9, 0.99);
  const transientDetectorMid = useTransientDetector(4, 0.5, 0.99);
  const transientDetectorHigh = useTransientDetector(1.5, 0.9, 0.99);
  
  let time = 0; // time since first update (frames)
  

  const NUMBER_OF_GLIMMERS = 400;

  const BG_COLOR_LOW = { r: 0, g: 2, b: 18, a: 1 };
  const BG_COLOR_HI = { r: 54, g: 3, b: 161, a: 1 };

  const GLIMMER_COLOR_LOW = { r: 6, g: 43, b: 65, a: 1 };
  const GLIMMER_COLOR_HIGH = { r: 186, g: 230, b: 253, a: 1 };
  const GLIMMER_COLOR_GLOW = { r: 16, g: 23, b: 73, a: 0.2 };

  const HIGH_FREQUENCY_SMOOTHING_FACTOR = 0.4;

  let lowEnergy = 0; // 0 - 1
  let midEnergy = 0;
  let highEnergy = 0;


  // Initialize glimmers
  const glimmers = [];  
  for(let i = 0; i < NUMBER_OF_GLIMMERS; i++) {
    
    const glimmer = createGlimmer();    
    glimmers.push(glimmer);
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
      const delayFactor = 0.1;
      glimmer.trigger(i * delayFactor);
    }
  }

  function drawFrame(ctx, width, height, frequencyData) {
    const origin = { x: (width / 2) + offsetX, y: (height / 2) + offsetY };  

    // Detect transients and trigger animations
    const lowTransient = transientDetectorLow.detect(frequencyUtils.getRange(frequencyData, 0, 100));
    if(lowTransient) trigger();
  
    const highFrequencies = frequencyUtils.getRange(frequencyData, 5000, 20000);
    const highFrequencyEnergy = highFrequencies.reduce((acc, val) => acc + val, 0) / highFrequencies.length;
    const highFrequencyEnergyNormalized = highFrequencyEnergy / 255;    
    highEnergy = highFrequencyEnergyNormalized * HIGH_FREQUENCY_SMOOTHING_FACTOR;    

    // Draw background
    const bg = lerpColor(BG_COLOR_LOW, BG_COLOR_HI, highEnergy);
    ctx.fillStyle = `rgba(${bg.r}, ${bg.g}, ${bg.b}, ${bg.a})`;
    ctx.fillRect(0, 0, width, height);

    // Draw glows
    for(let i = 0; i < glimmers.length; i++) {
      
      const glimmer = glimmers[i];
      
      const { x: xFib, y: yFib } = getPosition(i);      
      const distanceFromOrigin = Math.sqrt(xFib * xFib + yFib * yFib);
      const tDistance = Math.min(distanceFromOrigin / (width / 2), 1); // 0 - 1
      
      glimmer.setPosition(origin.x + xFib, origin.y + yFib);
      const alpha = lerp(1, 0, tDistance); // Vignette
      glimmer.setColorLow({ ...GLIMMER_COLOR_LOW, a: alpha });
      glimmer.setColorHigh({ ...GLIMMER_COLOR_HIGH, a: alpha });
      glimmer.setColorGlow(GLIMMER_COLOR_GLOW)
      
      glimmer.drawGlow(ctx);
    }

    // Draw speculars
    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
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