import createGlimmer from "./createGlimmer.js";

function getPosition(index) {
  const angle = index / 0.9;
  const x = Math.round(Math.cos(angle) * index * 10);
  const y = Math.round(Math.sin(angle) * index * 10);
  return { x, y };
}

export default function useGlimmers() {
  let time = 0;
  const glimmers = [];

  const startColor = { r: 6, g: 43, b: 65, a: 1 }
  const endColor = { r: 186, g: 230, b: 253, a: 1 }
  for(let i = 0; i < 100; i++) {
    glimmers.push(createGlimmer(startColor, endColor));
  }

  function drawFrame(ctx, width, height) {    

    const origin = { x: width / 2, y: height / 2}

    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const { x: xFib, y: yFib } = getPosition(i);
      glimmer.setPosition(origin.x + xFib, origin.y + yFib);
      glimmer.draw(ctx);
      glimmer.update();
      if(i === time) glimmer.start();
    }

    time += 1;
  };
  
  return {
    drawFrame,
  }
}