import lerp, { ease, easeInOutQuadratic, parabola } from './lerp.js';

export default function createGlimmer(colorLow = { r: 255, g: 0, b: 0, a: 1 }, colorHigh = { r: 0, g: 0, b: 255, a: 1 } ) {
  
  const radius = 4; // max radius of glimmer
  const lifetime = 50; // frames
  
  let alive = false;
  let time = 0; // time since first update (frames)
  let x = 0;
  let y = 0;
  let energy = 0;  

  /**
   * Linear interpolation between two colors based
   * on energy [0, 1]
   * @param {*} energy 
   */
  function getColor() {
    const t = parabola(energy);
    const r = Math.round(lerp(colorLow.r, colorHigh.r, t));
    const g = Math.round(lerp(colorLow.g, colorHigh.g, t));
    const b = Math.round(lerp(colorLow.b, colorHigh.b, t));
    const a = lerp(colorLow.a, colorHigh.a, t);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function setPosition(_x, _y) {
    x = _x; 
    y = _y;
  }

  function update() {
    if(alive){
      time += 1;
      energy = time / lifetime;
    }
  }

  function start() {
    alive = true;
    time = 0;
    energy = 0;
  }

  function draw(ctx) {
    ctx.fillStyle = getColor();
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, radius, parabola(energy)), 0, 2 * Math.PI);
    ctx.fill();

    if(time > lifetime) alive = false;
    
  }

  return {
    setPosition,
    start,
    update,    
    draw
  }
}