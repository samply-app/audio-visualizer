export default function useTransientDetector(threshold = 1.5, smoothingFactor = 0.9, peakDecayFactor = 0.9, gate=200) {
  let smoothedAmplitude = 0;
  let peakAmplitude = 0;

  // 1) Calculate the average amplitude of the frequency data
  // 2) Apply a noise gate to avoid false positives from noise
  // 3) Smooth the amplitude with a moving average over two frames

 /**
  * Detect a transient in the frequency data
  * @param {*} frequencyData
  * @returns {boolean} true if transient detected
  */
  function detect(frequencyData) {
    const amplitude = frequencyData.reduce((acc, val) => acc + val, 0) / frequencyData.length;
    if(amplitude < gate) return false;
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