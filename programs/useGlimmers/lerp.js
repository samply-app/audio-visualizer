// Lerping is cool: https://youtu.be/YJB1QnEmlTs?si=g8Wz_LmLqZ4hZW1_

/**
   * Linearly interpolate between two values
   * @param {*} a 
   * @param {*} b 
   * @param {*} t 
   * @returns 
   */
  export default function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  export function ease(t) {
    return t * t * t * t * t;
  }

  export function elasticOut(t) {
    Math.sin(-13.0 * (t + 1.0) * Math.PI / 2) * Math.pow(2.0, -10.0 * t) + 1.0;
  }

  export function easeInOutQuadratic(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  export function parabola(t) {
    return Math.pow(4 * t * (1 - t), 0.5);
  }