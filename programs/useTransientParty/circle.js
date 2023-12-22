import lerp from "../../utils/lerp";

export default function createCircle(attack=10, release=100) {

  let t = 0; // 0-1
  let growing = false;  
  
  function trigger() {
    growing = true;
  }

  function drawFrame(ctx, x=0, y=0, maxRadius=100) {
    // Update state
    if(growing) {
      
      if(t > 1) {
        t = 0;
        growing = false;
      }
    }
    // Render
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(x, y, maxRadius * (t/20), 0, 2 * Math.PI);
    ctx.fill();
  }

  return {
    drawFrame,
    trigger
  }
}