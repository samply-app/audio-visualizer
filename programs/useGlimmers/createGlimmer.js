import lerp, { ease, easeInOutQuadratic, parabola } from './lerp.js';

export default function createGlimmer() {
    
  let lifetime = 50;
  let colorLow = { r: 0, g: 0, b: 0, a: 0 };
  let colorHigh = { r: 0, g: 0, b: 0, a: 0 };
  
  const triggerQueue = []; // List of times to trigger (frames)
  
  let time = lifetime; // time since first update (frames)
  
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

  function setColorLow(_colorLow) {
    colorLow = _colorLow;
  }

  function setColorHigh(_colorHigh) {
    colorHigh = _colorHigh;
  }


  function update() {    
    if(time < lifetime) {
      time += 1;
    }
    t = (lifetime - time) / lifetime;

    // Update trigger queue
    if (triggerQueue.length) {
      for(let i = 0; i < triggerQueue.length; i++) {
        const triggerTime = triggerQueue[i];
        if (triggerTime <= 0) {
          triggerQueue.splice(i, 1); // Remove from queue
          resetTime();
        } else {
          triggerQueue[i] -= 1;
        }
      }
    }
  }

  function trigger(_delay = 0) {
    if (_delay) return triggerQueue.push(_delay);
    else {
      resetTime();
    }
  }

  function drawSpecular(ctx) { 
    const p = easeInOutQuadratic(t);
    const radius = 4;

    const r = Math.round(lerp(colorLow.r, colorHigh.r, p));
    const g = Math.round(lerp(colorLow.g, colorHigh.g, p));
    const b = Math.round(lerp(colorLow.b, colorHigh.b, p));
    const a = lerp(colorLow.a, colorHigh.a, p).toFixed(2);
    const glintColor = `rgba(${r}, ${g}, ${b}, ${a})`;

    ctx.fillStyle = glintColor;
    ctx.beginPath();
    ctx.arc(x, y, lerp(0, radius, t), 0, 2 * Math.PI);
    ctx.fill();
    
  }

  function drawGlow(ctx) {
    const p = t;
    const glowColorInner = `rgba(${colorLow.r}, ${colorLow.g}, ${colorLow.b}, ${0.1})`;
    const glowColorOuter = `rgba(${colorLow.r}, ${colorLow.g}, ${colorLow.b}, ${0})`;
    const glowRadius = 256;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, lerp(0, glowRadius, p));
    gradient.addColorStop(0, glowColorInner);
    gradient.addColorStop(1, glowColorOuter);
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
    setColorLow,
    setColorHigh,
  }
}