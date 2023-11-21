import lerp, { ease, easeInOutQuadratic, parabola } from './lerp.js';

export default function createGlimmer(colorLow = { r: 255, g: 0, b: 0, a: 1 }, colorHigh = { r: 0, g: 0, b: 255, a: 1 } ) {
    
  const lifetime = 500; // frames
  
  let delayTime = 0; // time until trigger occurs (frames)
  let reverseTime = 100
  
  let time = 0; // time since first update (frames)
  
  let x = 0;
  let y = 0;
  let t = 0;  

  function setPosition(_x, _y) {
    x = _x; 
    y = _y;
  }

  function resetTime() {
    time = 0;
  }

  function update() {
    if (delayTime) return delayTime -= 1; // Wait until delay is over to
    if(time !== lifetime) {
      time += 1;
    }
    
    t = (lifetime - time) / lifetime;
  }

  function trigger(_delay = 0) {
    time = 0;
    t = 0;
    delayTime = _delay;
  }

  function drawSpecular(ctx) { 
    const p = t;
    const radius = 4;

    const r = Math.round(lerp(colorLow.r, colorHigh.r, p));
    const g = Math.round(lerp(colorLow.g, colorHigh.g, p));
    const b = Math.round(lerp(colorLow.b, colorHigh.b, p));
    const a = lerp(colorLow.a, colorHigh.a, p);
    const glintColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    ctx.fillStyle = glintColor;
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, radius, t), 0, 2 * Math.PI);
    ctx.fill();
    
  }

  function drawGlow(ctx) {
    const p = t;
    const glowColor = `rgba(${colorLow.r}, ${colorLow.g}, ${colorLow.b}, ${0.1})`;
    const glowRadius = 256;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, glowRadius, p), 0, 2 * Math.PI);
    ctx.fill();
  }

  function draw(ctx) {
    const p = parabola(t);  
    drawGlow(ctx, p);
    drawSpecular(ctx, p);    
  }

  return {
    setPosition,
    trigger,
    update,    
    draw,
    drawGlow,
    drawSpecular,
  }
}