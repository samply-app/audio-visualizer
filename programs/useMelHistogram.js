import useFrequencyUtils from "../utils/useFrequency.js";

export default function useHistogram(sampleRate, fftSize) {
  const frequencyUtils = useFrequencyUtils(sampleRate, fftSize);

  function drawFrame(ctx, width, height, dataArray) {
    const normData = []
    for (let i = 0; i < dataArray.length; i++) {
      normData.push(dataArray[i] / 255);
    }

    const melDataRaw = frequencyUtils.melSpectrogram(normData);
    const melData = melDataRaw.slice(0, melDataRaw.length - 42); // Safari doesn't need this trimming for some reason

    const bufferLength = melData.length;

    var barWidth = (width / bufferLength);
    var barHeight; 
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = Math.log(1 + melData[i]) * 16 * height; // Normalization * 4 is better on Safari
        ctx.fillStyle = `rgba(${255 - 2 * i},${50 - i},${50 + i * 2},` + (barHeight / 255) + ')';
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }

  };

  return {
    drawFrame
  }

}