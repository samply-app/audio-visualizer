export default function useTestChart() {

  function drawFrame(ctx, width, height) {  

    ctx.fillStyle = 'rgba(255,0,255,0.5)';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillRect(width - 100, 0, 100, 100);
    ctx.fillRect(0, height - 100, 100, 100);
    ctx.fillRect(width - 100, height - 100, 100, 100);

  };

  return {
    drawFrame
  }

}