import createGlimmer from "./createGlimmer.js";
import lerp from './lerp.js';

export default function useGlimmers() {
  let time = 0;
  const glimmers = [];

  const numberOfGlimmers = 100;

  // Initialize glimmers
  for(let i = 0; i < numberOfGlimmers; i++) {
    const startColor = { r: 6, g: 43, b: 65, a: 0 }
    const endColor = { r: 186, g: 230, b: 253, a: (numberOfGlimmers - i) / numberOfGlimmers  }
    glimmers.push(createGlimmer(startColor, endColor));
  }

  function getPosition(index) {
    const t = Math.min(time / 10000, 1);    
    const angle = index / lerp(0.8, 0.99, t);
    const x = Math.round(Math.cos(angle) * index * 10);
    const y = Math.round(Math.sin(angle) * index * 10);
    return { x, y };
  }

  function drawFrame(ctx, width, height) {    

    const origin = { x: width / 2, y: height / 2}

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

  function trigger() {
    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const delayFactor = 2;
      glimmer.trigger(i * delayFactor);
    }
  }
  
  return {
    drawFrame,
    trigger,
  }
}