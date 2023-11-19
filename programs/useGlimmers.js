function getPosition(index) {
  const x = Math.round(Math.cos(index) * index * 10);
  const y = Math.round(Math.sin(index) * index * 10);
  return { x, y };
}

function createGlimmer() {
  
  const colorLow = { r: 0, g: 43, b: 65, a: 0 }
  const colorHigh = { r: 186, g: 230, b: 253, a: 1 }
  const radius = 1; // max radius of glimmer
  
  let time = 0; // time since first update (frames)
  let x = 0;
  let y = 0;
  let energy = 0;
  
  /**
   * Linearly interpolate between two values
   * @param {*} a 
   * @param {*} b 
   * @param {*} t 
   * @returns 
   */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function ease(t) {
    return t * t * t * t * t;
  }

  /**
   * Linear interpolation between two colors based
   * on energy [0, 1]
   * @param {*} energy 
   */
  function getColor() {
    const r = Math.round(lerp(colorLow.r, colorHigh.r, energy));
    const g = Math.round(lerp(colorLow.g, colorHigh.g, energy));
    const b = Math.round(lerp(colorLow.b, colorHigh.b, energy));
    const a = lerp(colorLow.a, colorHigh.a, ease(energy));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function setPosition(_x, _y) {
    x = _x; 
    y = _y;
  }

  function update() {
    time += 1;
    energy = 1;
  }

  function reset(){
    time = 0;
    energy = 0;
  }
  

  function draw(ctx) {
    ctx.fillStyle = getColor(0.5);
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, 8, energy * radius), 0, 2 * Math.PI);
    ctx.fill();

    if(time > 100) reset();
  }

  return {
    setPosition,
    update,
    reset,
    draw
  }
}

export default function useGlimmers() {
  let time = 0;
  const glimmers = [];

  for(let i = 0; i < 100; i++) {
    glimmers.push(createGlimmer());
  }

  function drawFrame(ctx, width, height) {    

    const origin = { x: width / 2, y: height / 2}

    for(let i = 0; i < glimmers.length; i++) {
      const glimmer = glimmers[i];
      const { x: xFib, y: yFib } = getPosition(i);
      glimmer.setPosition(origin.x + xFib, origin.y + yFib);
      glimmer.draw(ctx);
      glimmer.update();
    }

    time += 1;
  };
  
  return {
    drawFrame
  }
}