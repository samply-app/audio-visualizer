import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from '../useVisualizer';

interface Vec2 { x: number; y: number; }


function init(context: CanvasRenderingContext2D) {
  // optional
}

let counter = 0;

const randomSeries: number[] = [];
for (let i = 0; i < 128; i += 1) {
  randomSeries.push(Math.random());
}

function frameHandler(ctx: CanvasRenderingContext2D, frequency: Uint8Array, time: Uint8Array, deltaTime: number, deltaFrames: number) {

  let lastCp: Vec2 = { x: 0, y: 0 }
  let lastTarget: Vec2 = { x: 0, y: 0 }

  function lineSquiggle(target: Vec2, magnitude: number) {
    const waveLength = Math.hypot((target.x - lastTarget.x), (target.y - lastTarget.y));
    ctx.moveTo(lastTarget.x, lastTarget.y);
    // cast a ray through cp2 of previous and start of current bezier
    const carryOverVector = {
      x: lastTarget.x + lastTarget.x - lastCp.x,
      y: lastTarget.y + lastTarget.y - lastCp.y
    }
    const cp1x = carryOverVector.x // start.x + (1 * waveLength) / 3;
    const cp1y = carryOverVector.y // start.y + magnitude;
    const cp2x = lastCp.x = lastTarget.x + (2 * waveLength) / 3;
    const cp2y = lastCp.y = lastTarget.y - magnitude;
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, target.x, target.y);
    lastTarget = target;
  }

  // Draw fractals at certain velocities, changing velocity based on audio energy.  
  const { width, height } = ctx.canvas;
  // Coordinate transforms  
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(1, -1);
  //   
  ctx.lineWidth = 4
  ctx.lineCap = "round";
  

  let target: Vec2 = { x: 0, y: 0 };
  let drawLength = (counter) % time.length;
  counter += 1

  let seed = 0;

  for (let i = 0; i < drawLength; i += 1) {
    ctx.beginPath();
    seed = (seed + 1) % 100; // TODO: better "seed"
    const vec: Vec2 = { x: Math.cos(i), y: Math.sin(i) }

    const stepDistance = i * 1;
    // Generate target while keeping in screen bounds.
    let xPos = target.x + vec.x * stepDistance;
    if (xPos < -width / 2 || xPos > width / 2) xPos = target.x - vec.x * stepDistance * randomSeries[seed];

    let yPos = target.y + vec.y * stepDistance * randomSeries[seed];
    if (yPos < -height / 2 || yPos > height / 2) yPos = target.y - vec.y * stepDistance * randomSeries[seed];

    target = { x: xPos, y: target.y + vec.y * stepDistance * randomSeries[seed + 2] }

    lineSquiggle(target, frequency[i]);
    ctx.strokeStyle = `hsl(0, 100%, ${(i/drawLength*50).toFixed(0)}%)`;  
  ctx.stroke();
  }
  

  // ctx.strokeStyle = "orange";
  // ctx.lineWidth = 4
  // ctx.lineCap = "round";

  // ctx.moveTo(0, 0)
  // lastTarget = {x: 0, y: 0}
  // lastCp = {x: 100, y: 100}
  // ctx.beginPath();  
  // lineSquiggle({x: -100, y: -100}, time[0]);
  // lineSquiggle({x: 0, y: 100}, time[1]);
  // lineSquiggle({x: 20, y: 800}, time[2]);
  // lineSquiggle({x: -400, y: 0}, time[3]);
  // lineSquiggle({x: 500, y: -500}, time[4]);
  // lineSquiggle({x: 100, y: 10}, time[5]);
  // lineSquiggle({x: 120, y: 6}, time[5]);
  // ctx.stroke();

  ctx.restore();
}

const program: Program = {
  contextId: '2d',
  fftSize: 2048,
  smoothingTimeConstant: 0.3,
  init,
  frameHandler,
}

export default program;