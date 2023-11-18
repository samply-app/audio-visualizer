export default function useHistogram() {

  function drawFrame(ctx, width, height, dataArray) {

    const bufferLength = dataArray.length;

    var barWidth = (width / bufferLength);
    var barHeight; 
    var x = 0;

    for (var i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;
        ctx.fillStyle = 'rgba(255,50,50,' + (barHeight / 255) + ')';
        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }

  };

  return {
    drawFrame
  }

}