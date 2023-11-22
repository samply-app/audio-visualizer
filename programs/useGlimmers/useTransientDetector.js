export default function useTransientDetector() {
  const threshold = 4;

  const smoothingFactor =  0.9;
  let smoothedAmplitude = 0;

  const peakDecayFactor = 0.99;
  let peakAmplitude = 0;

 /**
  * Detect a transient in the frequency data
  * @param {*} frequencyData
  * @returns {boolean} true if transient detected
  */
  function detect(frequencyData) {
    const amplitude = frequencyData.reduce((acc, val) => acc + val, 0) / frequencyData.length;
    smoothedAmplitude = smoothedAmplitude * smoothingFactor + amplitude * (1 - smoothingFactor);

    if(smoothedAmplitude > threshold * peakAmplitude) {
      peakAmplitude = smoothedAmplitude;
      return true;
    } else {
      peakAmplitude *= peakDecayFactor;
      return false;
    }
  }

  return {
    detect
  }
  
}