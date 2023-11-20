import lerp, { ease, easeInOutQuadratic, parabola } from './lerp.js';

export default function createGlimmer(colorLow = { r: 255, g: 0, b: 0, a: 1 }, colorHigh = { r: 0, g: 0, b: 255, a: 1 } ) {
  
  const radius = 4; // max radius of glimmer
  const lifetime = 50; // frames
  
  let alive = false;
  let time = 0; // time since first update (frames)
  let delay = 0;
  let x = 0;
  let y = 0;
  let energy = 0;  

  function setPosition(_x, _y) {
    x = _x; 
    y = _y;
  }

  function update() {
    if (alive) {
      if (time < delay) {
        delay -= 1;
        return;
      }
      time += 1;
      energy = time / lifetime;
    }
  }

  function start(_delay = 0) {
    if(alive) return;
    alive = true;
    time = 0;
    energy = 0;
    delay = _delay;
  }

  function draw(ctx) {
    if(!alive) return;
    const t = parabola(energy);
    
    const alpha = lerp(colorLow.a, colorHigh.a, t);
    const glowColor = `rgba(${colorLow.r}, ${colorLow.g}, ${colorLow.b}, ${isNaN(alpha) ? 0 : alpha})`;
    const glowRadius = 32;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * glowRadius);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, radius * glowRadius, parabola(energy)), 0, 2 * Math.PI);
    ctx.fill();

    const r = Math.round(lerp(colorLow.r, colorHigh.r, t));
    const g = Math.round(lerp(colorLow.g, colorHigh.g, t));
    const b = Math.round(lerp(colorLow.b, colorHigh.b, t));
    const a = lerp(colorLow.a, colorHigh.a, t);
    const glintColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    ctx.fillStyle = glintColor;
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