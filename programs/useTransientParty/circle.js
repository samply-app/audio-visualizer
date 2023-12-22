export default function createCircle() {

  let alive = false;
  
  function trigger() {
    alive = true;
    setTimeout(() => alive = false, 200);
  }

  function draw(ctx, x=0, y=0, maxRadius=100) {
    if(!alive) return;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, maxRadius, 0, 2 * Math.PI);
    ctx.fill();
  }

  return {
    draw,
    trigger
  }
}