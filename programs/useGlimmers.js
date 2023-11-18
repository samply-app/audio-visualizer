export default function useGlimmers() {
  function drawFrame(ctx, width, height) {    
    ctx.fillStyle = 'rgba(255, 0, 255, 0.5)';
    ctx.fillRect(100, 100, 100, 100);
  };
  
  return {
    drawFrame
  }
}