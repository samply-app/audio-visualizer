import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from "../useVisualizer";

interface Vec2 {
  x: number;
  y: number;
}

function init(context: CanvasRenderingContext2D) {
  // optional
}

function frameHandler(
  ctx: CanvasRenderingContext2D,
  frequency: Uint8Array,
  time: Uint8Array,
  deltaTime: number,
  deltaFrames: number
) {
  const { width, height } = ctx.canvas;
  const center: Vec2 = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };

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
    ctx.strokeStyle = "cyan";
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.stroke();
    // Draw control points
    ctx.strokeStyle = "orange";
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

  /** Return a cartesian point from a radial magnitude and an angular */
  function polarToCartesian(radialMag: number, thetaRads: number): Vec2 {
    const minRadius = 100;
    var x = (radialMag + minRadius) * Math.cos(thetaRads);
    var y = (radialMag + minRadius) * Math.sin(thetaRads);
    return { x, y };
  }

  const radials = 12;

  function getRadialAngleRadians(radial: number) {
    return (radial * Math.PI * 2) / radials;
  }

  function plotPortalRadial(radialMag: number, thetaRads: number) {
    // KLS DEBUG Draw dots to map out shape

    // get polar coordinates
    const radialVec = polarToCartesian(radialMag, thetaRads);

    // transform to center
    radialVec.x += center.x;
    radialVec.y += center.y;

    // console.log("kls radialVec", radialVec);
    ctx.fillRect(radialVec.x, radialVec.y, 10, 10);

    return radialVec;

    // // First segment
    // let start = { x: ctx.canvas.height / 2, y: ctx.canvas.height / 2 };
    // let end = valleyPosition;
    // let cp1 = { x: peakHandleWidth, y: start.y };
    // let cp2 = { x: end.x - valleyHandleWidth, y: end.y };

    // ctx.beginPath();
    // ctx.moveTo(start.x, start.y);
    // ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    // // drawBezier(start, cp1, cp2, end)
    // // Second segment
    // start = valleyPosition;
    // end = { x: width, y: peakPosition };
    // cp1 = { x: start.x + valleyHandleWidth, y: start.y };
    // cp2 = { x: end.x - peakHandleWidth, y: end.y };

    // // drawBezier(start, cp1, cp2, end)

    // ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);

    // // Straight line down to baseline
    // ctx.lineTo(end.x, height);
    // // Straight line back across baseline
    // ctx.lineTo(0, height);
  }

  const corePortalArray: Vec2[] = [];

  for (let i = 1; i <= radials; i += 1) {
    let valleyPosition = {
      x: 0.5 * width,
      y: (1 / (radials - (i - 1))) * height + frequency[i] * 2
    };

    let gradient = ctx.createLinearGradient(0, 0, width, 0); // horizontal gradient

    // const luma = `${((i / radials) * 50).toFixed(0)}%`;
    const luma = "50%";

    gradient.addColorStop(0, `hsl(0, 50%, ${luma})`);
    gradient.addColorStop(valleyPosition.x / width, `hsl(0, 50%, ${luma})`);
    gradient.addColorStop(1, `hsl(0, 50%, ${luma})`);

    corePortalArray.push(
      plotPortalRadial(
        frequency[frequency.length / 2 - i] * 5,
        getRadialAngleRadians(i)
      )
    );

    ctx.fillStyle = gradient;
    ctx.fill();
  }
  drawBezier(center, corePortalArray[0], corePortalArray[1], center);
  drawBezier(
    corePortalArray[0],
    corePortalArray[1],
    corePortalArray[2],
    corePortalArray[3]
  );

  bezierCurveThrough(corePortalArray);
}

const program: Program = {
  contextId: "2d",
  fftSize: 512,
  smoothingTimeConstant: 0.9,
  init,
  frameHandler
};

export default program;
