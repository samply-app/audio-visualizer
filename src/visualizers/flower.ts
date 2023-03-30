import { ref, watch } from "vue";
import { Program, AMPLITUDE_TIME, AMPLITUDE_FREQUENCY } from "../useVisualizer";

interface Vec2 {
  x: number;
  y: number;
}

interface Polar2 {
  r: number;
  theta: number;
}

function init(context: CanvasRenderingContext2D) {
  // optional
}

const radialCount = 12;
let lastFreqMags: Uint8Array = new Uint8Array(radialCount);
let rays: {
  velocity: number;
  point: Polar2;
  hsl: { h: number; s: number; l: number };
}[] = Array.from({ length: radialCount }, () => ({ velocity: 0, r: 0 }));

// #region Animation Globals
const rayThreshold = 0.8;

let rotation = 0;
const rotationIncrement = 0.002;

let hueShift = 0;
const hueSpread = 70;
const hueIncrement = 0.3;
// #endregion Animation Globals

// #region Debug

// #endregion Debug

function frameHandler(
  ctx: CanvasRenderingContext2D,
  frequency: Uint8Array,
  time: Uint8Array,
  deltaTime: number,
  deltaFrames: number
) {
  const { width, height } = ctx.canvas;
  const center: Vec2 = { x: ctx.canvas.width / 2, y: ctx.canvas.height / 2 };
  const minRadius = 50;
  const velocityScalar = 1;
  const maxRayLength = Math.min(width, height);

  /** Draw centered outlined points */
  function drawDebugPoint(point: Vec2, radius = 4, color = "aqua") {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  /**
   * Draw and highlight the control points of a bezier curve
   * Use for debugging.
   * @param start
   * @param cp1
   * @param cp2
   * @param end
   */
  function drawBezier(
    start: Vec2,
    cp1: Vec2,
    cp2: Vec2,
    end: Vec2,
    curveColor = "cyan",
    curveFill?: string
  ) {
    // Draw bezier curve
    ctx.strokeStyle = curveColor;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    if (curveFill) {
      ctx.fillStyle = curveFill;
      ctx.fill();
    }
    ctx.lineWidth = 4;
    ctx.strokeStyle = curveColor;
    ctx.stroke();
    // Draw control points
    // ctx.strokeStyle = "orange";
    // ctx.beginPath();
    // ctx.arc(start.x, start.y, pointRadius, 0, 2 * Math.PI);
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.arc(cp1.x, cp1.y, pointRadius, 0, 2 * Math.PI);
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.arc(cp2.x, cp2.y, pointRadius, 0, 2 * Math.PI);
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.arc(end.x, end.y, pointRadius, 0, 2 * Math.PI);
    // ctx.stroke();
  }

  /** Return a cartesian point from a radial magnitude and an angular */
  function polarToCartesian(polar: Polar2): Vec2 {
    var x = (polar.r + minRadius) * Math.cos(polar.theta);
    var y = (polar.r + minRadius) * Math.sin(polar.theta);
    return { x, y };
  }

  function cartesianToPolar(vec: Vec2): Polar2 {
    const r = Math.sqrt(vec.x ** 2 + vec.y ** 2);
    const theta = Math.atan2(vec.y, vec.x);
    return { r, theta };
  }

  /** Get the angle in radians of the specified radial index  */
  function getRadialAngleRadians(
    radial: number,
    count = radialCount,
    arcLength = 2 * Math.PI
  ) {
    return (radial * arcLength) / count;
  }

  // grab some frequencies and mirror them
  const frequencies = Array.from(frequency.slice(0, radialCount / 2));
  frequencies.push(...frequencies.slice());

  /** Draw a ray given polar coordinates */
  function drawRay(point: Polar2, strokeColor = "cyan", fillColor = "cyan") {
    // Create control points on either side of vector
    const angularPadding = Math.PI / 16;
    let rayA_polar: Polar2 = {
      r: point.r,
      theta: point.theta - angularPadding
    };
    let rayB_polar: Polar2 = {
      r: point.r,
      theta: point.theta + angularPadding
    };
    const rayA_cart: Vec2 = polarToCartesian(rayA_polar);
    const rayB_cart: Vec2 = polarToCartesian(rayB_polar);

    // Draw the ray
    drawBezier(
      { x: 0, y: 0 },
      rayA_cart,
      rayB_cart,
      { x: 0, y: 0 },
      strokeColor,
      fillColor
    );

    // KLS DEBUG draw control points
    // drawDebugPoint(rayA_cart, 8, "red");
    // drawDebugPoint(rayB_cart, 8, "orange");
    // drawDebugPoint(polarToCartesian(point), 4, "cyan");
  }

  const corePortalArray: Polar2[] = Array.from(
    { length: radialCount },
    (_, idx) => ({
      r: minRadius + frequencies[idx] * velocityScalar,
      theta: getRadialAngleRadians(idx)
    })
  );

  // transform context to center
  ctx.translate(center.x, center.y);

  // Draw the core portal array
  ctx.beginPath();

  // const hues = Array.from({ length: radialCount / 2 }, (_, idx) =>
  //   Math.floor((idx * hueSpread) / idx)
  // );

  function getHslForRadial(idx: number): { h: number; s: number; l: number } {
    // make the hue "wrap" around the spread
    const hue = hueShift + (idx * hueSpread) / radialCount;
    return { h: hue, s: 50, l: 50 };
  }

  function makeColorStyleString(
    hue: number,
    saturation = 50,
    lightness = 50,
    alpha = 1
  ) {
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }

  // calculate radial velocity for each frequency
  frequencies.forEach((f, idx) => {
    const velocity: number = (f - lastFreqMags[idx]) / deltaTime;
    if (velocity > rayThreshold) {
      const { r, theta } = corePortalArray[idx];
      rays.push({
        velocity,
        point: { r, theta: theta + rotation },
        hsl: getHslForRadial(idx)
      });
    }
  });

  rays.forEach((ray, idx) => {
    if (ray.point?.r && ray.point?.r > maxRayLength) {
      ray.point = { r: 0, theta: 0 };
      ray.velocity = 0;
    }
    // if ray is active, draw it
    if (ray.point && ray.velocity > 0) {
      // get color - same for fill and stroke
      const color = makeColorStyleString(
        ray.hsl.h,
        ray.hsl.s,
        50 - (50 * ray.point.r) / maxRayLength,
        0.7
      );

      // draw the ray
      drawRay(ray.point, color, color);
      ray.point.r += ray.velocity;
    }
  });

  ctx.rotate(rotation);
  rotation += rotationIncrement;

  corePortalArray.forEach((point, idx) => {
    const hsl = getHslForRadial(idx);
    drawRay(point, "#000000A0", makeColorStyleString(hsl.h, hsl.s, hsl.l, 1));
  });

  ctx.resetTransform();
  ctx.closePath();

  // Update animation globals
  hueShift += hueIncrement;

  // set the last frequencies
  lastFreqMags = new Uint8Array(frequencies);
}

const program: Program = {
  contextId: "2d",
  fftSize: 512,
  smoothingTimeConstant: 0.9,
  init,
  frameHandler
};

export default program;