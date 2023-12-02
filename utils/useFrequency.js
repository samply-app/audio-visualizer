/**
 * Utilities to work with frequency data
 * @param {*} sampleRate 
 * @returns 
 */
export default function useFrequencyUtils(sampleRate) {

  /**
   * Returns a slice of the frequency data array
   * @param {*} frequencyData 
   * @param {*} startFrequency 
   * @param {*} endFrequency 
   * @returns 
   */
  function getRange(frequencyData, startFrequency, endFrequency) {
    const totalBins = frequencyData.length;  
    const startIndex = Math.floor((startFrequency / sampleRate) * totalBins);
    const endIndex = Math.floor((endFrequency / sampleRate) * totalBins);
  
    return frequencyData.slice(startIndex, endIndex + 1);  
  }

  return {
    getRange
  }
}