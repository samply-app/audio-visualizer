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
let rays: { velocity: number; point?: Polar2 }[] = Array.from(
  { length: radialCount },
  () => ({ velocity: 0, r: 0 })
);

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
  const corePortalArray: Vec2[] = [];
  const velocityScalar = 3;
  const maxRayLength = 500;

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
    const pointRadius = 4;
    ctx.lineWidth = 4;
    // Draw bezier curve
    ctx.strokeStyle = curveColor;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    if (curveFill) {
      ctx.fillStyle = curveFill;
      ctx.fill();
    }
    ctx.lineWidth = 10;
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

  /** Translate a vector to canvas center */
  function translateToCenter(vec: Vec2): Vec2 {
    vec.x += center.x;
    vec.y += center.y;
    return vec;
  }

  /** Translate a vector from canvas center */
  function translateFromCenter(vec: Vec2): Vec2 {
    vec.x -= center.x;
    vec.y -= center.y;
    return vec;
  }

  /** Get the angle in radians of the specified radial index  */
  function getRadialAngleRadians(
    radial: number,
    count = radialCount,
    arcLength = 2 * Math.PI
  ) {
    return (radial * arcLength) / count;
  }

  /** Get the angle in radians of the specified radial index  */
  function getTweenPoints(): Vec2[] {
    const tweenShift = (Math.PI * 2) / corePortalArray.length / 2;
    return Array.from({ length: corePortalArray.length }).map((_, i) =>
      translateToCenter(
        polarToCartesian({
          r: minRadius,
          theta: (i * Math.PI * 2) / corePortalArray.length + tweenShift
        })
      )
    );
  }

  /** Create a single radial point */
  function plotPortalRadial(radialMag: number, thetaRads: number) {
    // get polar coordinates
    const radialVec = polarToCartesian({ r: radialMag, theta: thetaRads });

    // transform to center
    radialVec.x += center.x;
    radialVec.y += center.y;

    // KLS DEBUG Draw dots to map out shape
    // ctx.fillRect(radialVec.x, radialVec.y, 10, 10);

    return radialVec;
  }

  /** Rotate a set of vectors about the  */
  function rotate2d(
    input: Vec2[],
    rads: number,
    aboutCenter: Vec2 = center
  ): Vec2[] {
    return input.map(vec => {
      // translate from center
      const rawVec = translateFromCenter(vec);

      // convert input to polar
      const polar = cartesianToPolar(rawVec);

      // rotate
      polar.theta += rads;
      return translateToCenter(polarToCartesian(polar));
    });
  }

  // mirror the frequency array
  const frequencies = Array.from(frequency.slice(0, radialCount / 2));
  frequencies.push(...frequencies.slice().reverse());

  // calculate radial velocity for each frequency
  frequencies.forEach((f, idx) => {
    const velocity: number = (f - lastFreqMags[idx]) / deltaTime;
    if (
      (!rays[idx]?.velocity && velocity > 0) ||
      velocity > rays[idx]?.velocity
    ) {
      rays[idx].velocity = velocity;
    }
  });

  /** Draw a ray given polar coordinates */
  function drawRay(point: Polar2, strokeColor = "cyan", fillColor = "cyan") {
    // Create control points on either side of vector
    const angularPadding = Math.PI / 8;
    let rayA_polar: Polar2 = {
      r: point.r,
      theta: point.theta - angularPadding
    };
    let rayB_polar: Polar2 = {
      r: point.r,
      theta: point.theta + angularPadding
    };
    if (point.r > 1200) {
      console.log(
        `kls point.theta: ${point.theta}, rayA_polar: ${rayA_polar.theta}, rayB_polar: ${rayB_polar.theta}`
      );
    }
    const rayA_cart: Vec2 = polarToCartesian(rayA_polar);
    const rayB_cart: Vec2 = polarToCartesian(rayB_polar);

    // Draw the ray
    drawBezier(center, rayA_cart, rayB_cart, center, strokeColor, fillColor);

    // KLS DEBUG draw control points
    drawDebugPoint(rayA_cart, 8, "red");
    drawDebugPoint(rayB_cart, 8, "orange");
    drawDebugPoint(polarToCartesian(point), 4, "cyan");
  }

  for (let i = 1; i <= radialCount; i += 1) {
    let valleyPosition = {
      x: 0.5 * width,
      y: (1 / (radialCount - (i - 1))) * height + frequency[i] * 2
    };

    let gradient = ctx.createLinearGradient(0, 0, width, 0); // horizontal gradient

    // const luma = `${((i / radialCount) * 50).toFixed(0)}%`;
    const luma = "50%";

    gradient.addColorStop(0, `hsl(0, 50%, ${luma})`);
    gradient.addColorStop(valleyPosition.x / width, `hsl(0, 50%, ${luma})`);
    gradient.addColorStop(1, `hsl(0, 50%, ${luma})`);

    corePortalArray.push(
      plotPortalRadial(
        minRadius + frequencies[i] * velocityScalar,
        getRadialAngleRadians(i)
      )
    );

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  // get the tweening points
  const tweenPoints: Vec2[] = getTweenPoints();
  const drawPoints = rotate2d(corePortalArray, Math.PI / 2);

  // Draw the core portal array
  ctx.beginPath();
  for (let i = 0; i < radialCount; i++) {
    drawBezier(
      center,
      drawPoints[i % radialCount],
      drawPoints[(i + 1) % radialCount],
      center,
      `hsl(${(i * 360) / radialCount}, 200%, 0%)`,
      `hsl(${(i * 360) / radialCount}, 50%, 50%)`
    );
  }
  // drawPoints.forEach((point, i) => {
  //   drawRay(cartesianToPolar(point), "white", "white");
  // });
  ctx.closePath();

  // Draw rays
  ctx.beginPath();
  rays.forEach((ray, i) => {
    if (!ray.point && !ray.velocity) {
      ray.point = cartesianToPolar(drawPoints[i]);
    } else {
      // ray.point.r += ray.velocity * deltaTime;
    }
    // convert back to cartesian
    // const rayCart = translateToCenter(
    //   polarToCartesian(rays[i % radialCount].point)
    // );
    // drawBezier(
    //   center,
    //   rays[i % radialCount].point,
    //   rays[(i + 1) % radialCount].point,
    //   center,
    //   "white",
    //   "white"
    // `hsl(${(i * 360) / radialCount}, 200%, 0%)`,
    // `hsl(${(i * 360) / radialCount}, 50%, 50%)`
    // );

    // reset extended rays
    // if (ray.point.r > maxRayLength) {
    //   ray.point = { r: 0, theta: 0 };
    //   ray.velocity = 0;
    // }
  });
  ctx.closePath();

  // // DEBUG draw tween points
  // for (let i = 0; i < tweenPoints.length; i++) {
  //   drawDebugPoint(tweenPoints[i], 4, i === 1 ? "red" : undefined);
  // }

  // // DEBUG draw core portal points
  // for (let i = 0; i < corePortalArray.length; i++) {
  //   drawDebugPoint(corePortalArray[i], 6, i === 1 ? "white" : "green");
  // }

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
