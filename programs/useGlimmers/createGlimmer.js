import lerp, { ease, easeInOutQuadratic, parabola } from './lerp.js';

export default function createGlimmer(colorLow = { r: 255, g: 0, b: 0, a: 1 }, colorHigh = { r: 0, g: 0, b: 255, a: 1 } ) {
    
  const lifetime = 50; // frames
  
  let delayTime = 0; // frames
  let reverseTime = 100
  
  let time = 0; // time since first update (frames)
  let alive = false;
  
  let x = 0;
  let y = 0;
  let t = 0;  

  function setPosition(_x, _y) {
    x = _x; 
    y = _y;
  }

  function update() {
    if (alive) {
      if (time < delayTime) {
        delayTime -= 1;
        return;
      }
      time += 1;
      t = time / lifetime;
    }
  }

  function trigger(_delay = 0) {
    if(alive) return;
    alive = true;
    time = 0;
    t = 0;
    delayTime = _delay;
  }

  function drawSpecular(ctx) { 
    if(!alive) return;
    const p = parabola(t);
    const radius = 4;

    const r = Math.round(lerp(colorLow.r, colorHigh.r, p));
    const g = Math.round(lerp(colorLow.g, colorHigh.g, p));
    const b = Math.round(lerp(colorLow.b, colorHigh.b, p));
    const a = lerp(colorLow.a, colorHigh.a, p);
    const glintColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    ctx.fillStyle = glintColor;
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, radius, parabola(t)), 0, 2 * Math.PI);
    ctx.fill();

    if(time > lifetime) alive = false;
    
  }

  function drawGlow(ctx) {
    if(!alive) return;
    const p = parabola(t);  
    const glowColor = `rgba(${colorLow.r}, ${colorLow.g}, ${colorLow.b}, ${0.1})`;
    const glowRadius = 256;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, glowRadius, parabola(t)), 0, 2 * Math.PI);
    ctx.fill();
  }

  function draw(ctx) {
    if(!alive) return;
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