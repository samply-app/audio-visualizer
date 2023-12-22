export default function useTransientParty() {

  function drawFrame(ctx, width, height, dataArray) {

    const bufferLength = dataArray.length;

    var barWidth = (width / bufferLength);
    var barHeight; 
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;
        ctx.fillStyle = 'rgba(50, 80, 20,' + (barHeight / 255) + ')';
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }

  };

  return {
    drawFrame
  }

}