export default function useFul() {

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function drawFrame(ctx, width, height, dataArray) {

    const bufferLength = dataArray.length;
    const midX = width / 2;
    const midY = height / 2;
    const thetaChunk = 2 * Math.PI / bufferLength;

    // ctx.strokeStyle = `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 0.5)`

    for (var i = 0; i < bufferLength; i++) {
      const theta = i * thetaChunk;

      const h = dataArray[i] * 3;
      const addX = Math.cos(theta) * h;
      const addY = Math.sin(theta) * h;

      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.lineTo(midX + addX, midY - addY);
      ctx.lineWidth = 5;
      ctx.stroke();
    }

  };

  return {
    drawFrame
  }

}