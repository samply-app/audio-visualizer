import createGlimmer from "./createGlimmer.js";
import lerp from './lerp.js';
import useTransientDetector from "./useTransientDetector.js";

export default function useGlimmers(offsetX = 0, offsetY = 0) {
  const transientDetector = useTransientDetector();

  let time = 0;
  const glimmers = [];

  const numberOfGlimmers = 1;

  // Initialize glimmers
  for(let i = 0; i < numberOfGlimmers; i++) {
    const startColor = { r: 6, g: 43, b: 65, a: 0 }
    const endColor = { r: 186, g: 230, b: 253, a: lerp(1, 0.5, i / numberOfGlimmers)  }
    glimmers.push(createGlimmer(startColor, endColor));
  }

  function getPosition(index) {
    const t = Math.min(time / 10000, 1);    
    const angle = index / lerp(0.8, 0.99, t);
    const x = Math.round(Math.cos(angle) * index * 10);
    const y = Math.round(Math.sin(angle) * index * 10);
    return { x, y };
  }


  function trigger() {
    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const delayFactor = 1;
      glimmer.trigger(i * delayFactor);
    }
  }

  function drawFrame(ctx, width, height, frequencyData) {   

    const origin = { x: (width / 2) + offsetX, y: (height / 2) + offsetY };

    // Draw background images (glows)
    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const { x: xFib, y: yFib } = getPosition(i);
      glimmer.setPosition(origin.x + xFib, origin.y + yFib);
      glimmer.drawGlow(ctx);
    }

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