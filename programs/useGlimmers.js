function fibonacciSpiralPoint(index, spacing = 10, radius = 10) {
  if (index < 0) {
    throw new Error("Index must be a non-negative integer");
  }

  if (index === 0) {
    return { x: 0, y: 0 };
  }

  let goldenRatio = (1 + Math.sqrt(5)) / 2;
  let angle = index * (2 * Math.PI / goldenRatio);
  let x = radius * Math.sqrt(index) * Math.cos(angle) * spacing;
  let y = radius * Math.sqrt(index) * Math.sin(angle) * spacing;

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
    // energy = time / 100;
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


const glimmer1 = createGlimmer();
const glimmer2 = createGlimmer();
const glimmer3 = createGlimmer();
const glimmer4 = createGlimmer();
const glimmer5 = createGlimmer();
const glimmer6 = createGlimmer();
const glimmer7 = createGlimmer();

export default function useGlimmers() {
  let time = 0;

  function drawFrame(ctx, width, height) {    

    const origin = { x: width / 2, y: height / 2}

    // const { x, y } = fibonacciSpiralDotPosition(origin.x, origin.y + 20, 0);
    // const { x2, y2 } = fibonacciSpiralDotPosition(origin.x, origin.y - 100, 0);
    // const { x3, y3 } = fibonacciSpiralDotPosition(origin.x + 20, origin.y, 0);

    // glimmer1.setPosition(200, 100);
    const { x: xFib1, y: yFib1 } = fibonacciSpiralPoint(0);
    glimmer1.setPosition(origin.x + xFib1, origin.y + yFib1);
    // glimmer3.setPosition(500, 500);

    glimmer1.draw(ctx);
    glimmer1.update();

    const { x: xFib2, y: yFib2 } = fibonacciSpiralPoint(1);
    glimmer2.setPosition(origin.x + xFib2, origin.y + yFib2);
    glimmer2.draw(ctx);
    glimmer2.update();    

    
    const { x: xFib3, y: yFib3 } = fibonacciSpiralPoint(2);
    glimmer3.setPosition(origin.x + xFib3, origin.y + yFib3);
    glimmer3.draw(ctx);
    glimmer3.update();

    const { x: xFib4, y: yFib4 } = fibonacciSpiralPoint(3);
    glimmer4.setPosition(origin.x + xFib4, origin.y + yFib4);
    glimmer4.draw(ctx);
    glimmer4.update();

    const { x: xFib5, y: yFib5 } = fibonacciSpiralPoint(4);
    glimmer5.setPosition(origin.x + xFib5, origin.y + yFib5);
    glimmer5.draw(ctx);
    glimmer5.update();

    const { x: xFib6, y: yFib6 } = fibonacciSpiralPoint(5);
    glimmer6.setPosition(origin.x + xFib6, origin.y + yFib6);
    glimmer6.draw(ctx);
    glimmer6.update();

    const { x: xFib7, y: yFib7 } = fibonacciSpiralPoint(6);
    glimmer7.setPosition(origin.x + xFib7, origin.y + yFib7);
    glimmer7.draw(ctx);
    glimmer7.update();

    time += 1;
  };
  
  return {
    drawFrame
  }
}