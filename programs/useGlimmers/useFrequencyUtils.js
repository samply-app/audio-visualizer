export default function useFrequencyUtils(sampleRate) {

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