function createGlimmer() {
  const colorLow = { r: 0, g: 43, b: 65, a: 0 }
  const colorHigh = { r: 186, g: 230, b: 253, a: 1 }
  
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
    energy = time / 100;
  }

  function reset(){
    time = 0;
    energy = 0;
  }
  

  function draw(ctx) {
    ctx.fillStyle = getColor(0.5);
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, 8, time / 100), 0, 2 * Math.PI);
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

export default function useGlimmers() {
  let time = 0;

  function drawFrame(ctx, width, height) {    

    glimmer1.setPosition(width / 3, height / 2);
    glimmer2.setPosition(width / 2, height / 2);
    glimmer3.setPosition(2 * width / 3, height / 2);

    glimmer1.draw(ctx);
    glimmer1.update();


    glimmer2.draw(ctx);
    glimmer2.update();    

    
    glimmer3.draw(ctx);
    glimmer3.update();

    time += 1;
  };
  
  return {
    drawFrame
  }
}