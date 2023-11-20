import lerp, { ease } from './lerp.js';

export default function createGlimmer() {
  
  const colorLow = { r: 255, g: 0, b: 0, a: 1 }
  const colorHigh = { r: 0, g: 0, b: 255, a: 1 }
  const radius = 16; // max radius of glimmer
  const lifetime = 30; // frames
  
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
    const r = Math.round(lerp(colorLow.r, colorHigh.r, energy));
    const g = Math.round(lerp(colorLow.g, colorHigh.g, energy));
    const b = Math.round(lerp(colorLow.b, colorHigh.b, energy));
    const a = lerp(colorLow.a, colorHigh.a, energy);
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
    ctx.arc(x, y, radius * energy, 0, 2 * Math.PI);
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