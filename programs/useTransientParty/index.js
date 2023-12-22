
import circle from "./circle.js";
import useTransientDetector from "../../utils/useTransientDetector.js";
import useFrequency from "../../utils/useFrequency.js";

const transients = useTransientDetector();
const frequencies = useFrequency();

const bigCircle = circle();
const lowCircle = circle();
const midCircle = circle();
const highCircle = circle();

export default function useTransientParty() {

  /**
   * 
   * @param {*} ctx CanvasRenderingContext2D
   * @param {*} width 
   * @param {*} height 
   * @param {*} dataArray 
   */
  function drawFrame(ctx, width, height, dataArray, time) {

    const lowNotch = 100; // Hz
    const midNotch = 1000; // Hz
    const highNotch = 5000; // Hz

    const fullTransient = time % 128 == 0; // transients.detect(dataArray);
    const lowTransient = time % 64 == 0; // transients.detect(frequencies.getRange(dataArray, 0, lowNotch));
    const midTransient = time % 32 == 0; // transients.detect(frequencies.getRange(dataArray, lowNotch, midNotch));
    const highTransient = time % 16 == 0; // transients.detect(frequencies.getRange(dataArray, midNotch, highNotch));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 0, 1)';
    ctx.fillRect(0, 0, width, height); // background

    ctx.fillStyle = 'rgba(255, 0, 0, 1)';

    const minDimension = Math.min(width, height);
    
    if (fullTransient) {      
      bigCircle.trigger();
    }
    if (lowTransient) {
      lowCircle.trigger();
    }
    if (midTransient) {
      midCircle.trigger();
    }
    if (highTransient) {
      highCircle.trigger();
    }

    bigCircle.draw(ctx, width / 2, height / 2, minDimension / 2);
    lowCircle.draw(ctx, 0, height / 2, minDimension / 6);
    midCircle.draw(ctx, width / 2, height / 2, minDimension / 6);
    highCircle.draw(ctx, width, height / 2, minDimension / 6);
  };

  return {
    drawFrame
  }

}