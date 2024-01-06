import useFrequencyUtils from "../utils/useFrequency.js";

export default function useWilly(sampleRate, fftSize) {
  const frequencyUtils = useFrequencyUtils(sampleRate, fftSize);

  function drawFrame(ctx, width, height, dataArray) {
    const normData = [];
    for (let i = 0; i < dataArray.length; i++) {
      normData.push(dataArray[i] / 255);
    }

    const melDataRaw = frequencyUtils.melSpectrogram(normData);
    const melData = melDataRaw.slice(0, melDataRaw.length - 42); // Safari doesn't need this trimming for some reason

    const bufferLength = melData.length;

    /// Animation below

    var barWidth = (width / bufferLength);
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
      var radius = Math.log(1 + melData[i]) * 16 * height; // Calculate the radius based on the value
      var y = height - radius; // Set the y-coordinate based on the radius

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI); // Draw a circle with the calculated radius
      ctx.fillStyle = `rgba(${255 - 2 * i},${50 - i},${50 + i * 2}, 1)`;
      ctx.fill();
      ctx.closePath();

      x += barWidth + 1;
    }
  };

  return {
    drawFrame
  }

}