import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from '../useVisualizer';

interface Vec2 { x: number; y: number; }


function init(context: CanvasRenderingContext2D) {
  // optional
}



function frameHandler(ctx: CanvasRenderingContext2D, frequency: Uint8Array, time: Uint8Array, deltaTime: number, deltaFrames: number) {

  const { width, height } = ctx.canvas;

  /**
   * Draw and highlight the control points of a bezier curve
   * Use for debugging.
   * @param start 
   * @param cp1 
   * @param cp2 
   * @param end 
   */
  function drawBezier(start: Vec2, cp1: Vec2, cp2: Vec2, end: Vec2) {
    const pointRadius = 4;
    ctx.lineWidth = 4;
    // Draw bezier curve
    ctx.strokeStyle = 'cyan';
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.stroke();
    // Draw control points
    ctx.strokeStyle = 'orange';
    ctx.beginPath();
    ctx.arc(start.x, start.y, pointRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cp1.x, cp1.y, pointRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cp2.x, cp2.y, pointRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(end.x, end.y, pointRadius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  function drawCanyonLayer(peakPosition: number, peakHandleWidth: number, valleyPosition: Vec2, valleyHandleWidth: number) {

    // First segment
    let start = { x: 0, y: peakPosition }
    let end = valleyPosition;
    let cp1 = { x: peakHandleWidth, y: start.y }
    let cp2 = { x: end.x - valleyHandleWidth, y: end.y }

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    // drawBezier(start, cp1, cp2, end)
    // Second segment
    start = valleyPosition;
    end = { x: width, y: peakPosition };
    cp1 = { x: start.x + valleyHandleWidth, y: start.y }
    cp2 = { x: end.x - peakHandleWidth, y: end.y }    

    // drawBezier(start, cp1, cp2, end)

    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    // Straight line down to baseline
    ctx.lineTo(end.x, height);
    // Straight line back across baseline
    ctx.lineTo(0, height);
  }

  const layers = 10;
  for(let i = 1; i <= layers; i+=1){
    let valleyPosition = { x: 0.5 * width, y: (1 / (layers - (i - 1))) * height + frequency[i] * 2 };    
    
    let gradient = ctx.createLinearGradient(0, 0, width, 0); // horizontal gradient

    const luma = `${((i / layers) * 50).toFixed(0)}%`    
    
    gradient.addColorStop(0, `hsl(0, 50%, ${luma})`);
    gradient.addColorStop(valleyPosition.x / width, `hsl(0, 50%, ${luma})`);
    gradient.addColorStop(1, `hsl(0, 50%, ${luma})`);
  
    drawCanyonLayer(((i) / layers) * height + frequency[frequency.length / 2 -i] * 2, width / 4, valleyPosition, width / 4);
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}

const program: Program = {
  contextId: '2d',
  fftSize: 512,
  smoothingTimeConstant: 0.9,
  init,
  frameHandler,
}

export default program;