import useFrequencyUtils from "../utils/useFrequency.js";

export default function useWilly(sampleRate, fftSize) {
  const frequencyUtils = useFrequencyUtils(sampleRate, fftSize);

  let circles;

  function drawFrame(ctx, width, height, dataArray) {
    const normData = [];
    for (let i = 0; i < dataArray.length; i++) {
      normData.push(dataArray[i] / 255);
    }

    const melDataRaw = frequencyUtils.melSpectrogram(normData);
    const melData = melDataRaw.slice(0, melDataRaw.length - 42); // Safari doesn't need this trimming for some reason

    const bufferLength = melData.length;

    // Initialize circles array if it's not already initialized
    if (!circles) {
      circles = new Array(bufferLength).fill().map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
      }));
    }

    var barWidth = (width / bufferLength);
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
      var radius = Math.log(1 + melData[i]) * 16 * height; // Calculate the radius based on the value

      // Update the circle's velocity based on its mass (melData[i])
      const gravity = 0.1 * melData[i];
      circles[i].vy += gravity;

      // Update the circle's position based on its velocity
      circles[i].x += circles[i].vx;
      circles[i].y += circles[i].vy;

      // If the circle hits the edge of the screen, reverse its velocity
      if (circles[i].x + radius > width || circles[i].x - radius < 0) {
        circles[i].vx *= -1;
      }
      if (circles[i].y + radius > height || circles[i].y - radius < 0) {
        circles[i].vy *= -1;
      }

      // Draw the circle at the new position
      ctx.beginPath();
      ctx.arc(circles[i].x, circles[i].y, radius, 0, 2 * Math.PI); // Draw a circle with the calculated radius
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