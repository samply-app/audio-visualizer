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

interface Flare2 {
  point: Polar2;
  hsl: { h: number; s: number; l: number };
  velocity: number;
  assymetry?: { a: number; b: number };
  axial?: Vec2;
}

interface Cme2 {
  radial: Polar2;
  velocity: number;
  hsl: { h: number; s: number; l: number };
  sizeMult: number;
  driftMult: number;
}

function init(context: CanvasRenderingContext2D) {
  // optional
}

// #region Default Config
const rayCount = 13;
const rayWidth = Math.PI / 16;
const flareWidth = rayWidth / 2;

const minRadius = 40;
// #endregion Default Config

let lastFreqMags: Uint8Array = new Uint8Array(rayCount);

// #region Animation Globals
// -- Shape
const rayAssymetryMag = 50; // pixel length value to randomize ray length
const lastRayAssymetry: { a: number; b: number } = Array.from(
  { length: rayCount },
  () => ({ a: 0, b: 0 })
);

// -- Velocity
let maxVelocity: number;

// ---- Rays
const rayVelScalar = 2;

// ---- Flares
const flareVelThreshold = 0.45; // threshold which generates flare
const flareVelMult = rayVelScalar * 5;
const flares: Flare2[] = [];
const flareVibrancyMult = 10;

// ---- Coronal Mass Ejection
const cmeVelMin = 5;
const cmeVelMult = flareVelMult * 1.5; // threshold which generates CME
const cmeSizeScalar = 20;
const cmes: Cme2[] = [];

// -- Rotation
let rotation = 0;
const rotationIncrement = 0.002;
// KLS TODO: const rotationVolScalar = 0.1;

// -- Color
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
  const maxRayLength = Math.min(width, height);

  // grab some frequencies to visualize
  const freqStart = 3;
  const frequencies = frequency.slice(freqStart, rayCount + freqStart);

  /** #Draw centered outlined points */
  function drawCenteredPoint(point: Vec2, radius = 4, color = "aqua") {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }

  /**
   * #Draw and highlight the control points of a bezier curve
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
  }

  /** #Draw #CME CorONaL MaSs ejECtiOn duuUUuUUddE */
  function drawCME(origin: Vec2, point: Vec2, color: string, size: number) {
    // Draw bezier curve
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(point.x, point.y);
    // Draw
    drawCenteredPoint(point, size, color);
    if (color) {
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  /** Return a cartesian point from a radial magnitude and an angular */
  function polarToCartesian(polar: Polar2): Vec2 {
    var x = polar.r * Math.cos(polar.theta);
    var y = polar.r * Math.sin(polar.theta);
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
    count = rayCount,
    arcLength = 2 * Math.PI
  ) {
    return (radial * arcLength) / count;
  }

  /** #Draw a ray given polar coordinates */
  function drawRay(
    point: Polar2,
    strokeColor = "cyan",
    fillColor = "cyan",
    angularWidth = rayWidth,
    axial: Polar2 = { r: 0, theta: 0 },
    assymetry: { a: number; b: number } = { a: 0, b: 0 }
  ) {
    // Create control points on either side of vector
    let rayA_polar: Polar2 = {
      r: point.r + assymetry.a,
      theta: point.theta - angularWidth
    };
    let rayB_polar: Polar2 = {
      r: point.r + assymetry.b,
      theta: point.theta + angularWidth
    };
    const rayA_cart: Vec2 = polarToCartesian(rayA_polar);
    const rayB_cart: Vec2 = polarToCartesian(rayB_polar);

    const axialCart = polarToCartesian(axial);

    // Draw the ray
    drawBezier(
      axialCart,
      rayA_cart,
      rayB_cart,
      axialCart,
      strokeColor,
      fillColor
    );
    // drawCME(axial, rayA_cart, rayB_cart, axial, strokeColor, fillColor);

    // KLS DEBUG draw control points
    // drawCenteredPoint(rayA_cart, 8, "red");
    // drawCenteredPoint(rayB_cart, 8, "orange");
    // drawCenteredPoint(polarToCartesian(point), 4, "cyan");
  }

  const corePortalArray: Polar2[] = Array.from(
    { length: rayCount },
    (_, idx) => ({
      r: minRadius + frequencies[idx] * rayVelScalar,
      theta: getRadialAngleRadians(idx)
    })
  );

  // transform context to center
  ctx.translate(center.x, center.y);

  // Draw the core portal array
  ctx.beginPath();

  // #Calculate #hues
  const hues: number[] = Array.from(
    { length: rayCount / 2 },
    (_, idx) => hueShift + (idx * hueSpread) / (rayCount / 2)
  );
  hues.push(...hues.slice().reverse());

  function getHslForRay(idx: number): { h: number; s: number; l: number } {
    // TODO make the hue "wrap" around the spread
    return { h: hues[idx], s: 50, l: 50 };
  }

  function makeColorStyleString(
    hue: number,
    saturation = 50,
    lightness = 50,
    alpha = 1
  ) {
    return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
  }

  // #Calculate #flare velocity for each frequency
  frequencies.forEach((f, idx) => {
    const velocity: number = (f - lastFreqMags[idx]) / deltaTime;
    if (velocity > flareVelThreshold) {
      const { r, theta } = corePortalArray[idx];
      const hsl = getHslForRay(idx);
      flares.push({
        velocity: velocity * flareVelMult,
        point: { r, theta: theta + rotation },
        hsl
      });
      // add #CME's
      const thetaDiff = Math.random() * rayWidth - rayWidth / 2;
      // TODO generate number of CME's and sizeMult based on velocity
      cmes.push({
        radial: { r: 0, theta: theta + thetaDiff },
        velocity: Math.max(velocity, cmeVelMin) + Math.random() * cmeVelMult,
        hsl,
        sizeMult: 5,
        driftMult: Math.random()
      });
    }
  });

  // #Draw background gradient
  const gradient = ctx.createRadialGradient(0, 0, 50, 0, 0, 1000);
  gradient.addColorStop(0, makeColorStyleString(hueShift));
  gradient.addColorStop(1, makeColorStyleString(hueShift, 70, 5));
  ctx.fillStyle = gradient;
  ctx.arc(0, 0, 1000, 0, 2 * Math.PI, false);
  ctx.fill();

  // #Draw #Flares
  const expiredFlareIdxs: number[] = [];
  flares.forEach((flare, idx) => {
    if (flare.point?.r > maxRayLength) {
      expiredFlareIdxs.push(idx);
      return;
    }
    // get color - same for fill and stroke
    const color = makeColorStyleString(
      flare.hsl.h,
      flare.hsl.s,
      50, // - (50 * flare.point.r) / maxRayLength,
      1 - flare.point.r / maxRayLength
    );

    // draw the ray
    const distanceMult = flare.point.r / maxRayLength;
    const { r, theta } = flare.point;
    const axial = {
      r: 0, // Math.max(r - distanceMult * 1000, 0),
      theta
    };
    drawRay(flare.point, color, color, flareWidth, axial);
    // draw CME if over velocity threshold
    flare.point.r += flare.velocity;
  });
  expiredFlareIdxs.forEach(idx => flares.splice(idx, 1));

  // #Draw #CME's
  const expiredCmeIdxs: number[] = [];
  cmes.forEach((cme, idx) => {
    // if cme is active, draw it
    if (cme.radial.r > maxRayLength) {
      expiredCmeIdxs.push(idx);
      return;
    }
    const distanceMult = cme.radial.r / maxRayLength;
    drawCME(
      center,
      polarToCartesian({
        r: cme.radial.r,
        theta:
          cme.radial.theta * (1 + Math.sin(cme.driftMult * distanceMult) / 2)
      }),
      makeColorStyleString(cme.hsl.h, cme.hsl.s, cme.hsl.l, 1 - distanceMult),
      distanceMult * 40
    );
    cme.radial.r += (1 - distanceMult) * cme.velocity;
  });
  expiredCmeIdxs.forEach(idx => cmes.splice(idx, 1));

  /** #Translate rotate the canvas after drawing flares
   * so they maintain their angular position */
  ctx.rotate(rotation);
  rotation += rotationIncrement;

  // #Draw Rays
  corePortalArray.forEach((point, idx) => {
    const hsl = getHslForRay(idx);
    const colorString = makeColorStyleString(hsl.h, hsl.s, hsl.l, 1);
    drawRay(point, "#000000", colorString, rayWidth);
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
