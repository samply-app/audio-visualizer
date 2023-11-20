import useGlimmers from './programs/useGlimmers/index.js';
import useHistogram from './programs/useHistogram.js';
import useTestChart from './programs/useTestChart.js';

let lastWidth = 0;
let lastHeight = 0;

function updateCanvasContext(context) {
  const canvas = context.canvas;
  const newWidth = canvas.clientWidth * devicePixelRatio;
  const newHeight = canvas.clientHeight * devicePixelRatio;
  if (lastWidth !== newWidth || lastHeight !== newHeight) {
    canvas.width = newWidth;
    canvas.height = newHeight;
    lastWidth = newWidth;
    lastHeight = newHeight;
  }
  return canvas;
}

window.onload = function () {
  // Get elements
  var audioInput = document.getElementById('audioInput');
  var startButton = document.getElementById('startButton');
  var visualization = document.getElementById('visualization');

  // Create audio context and analyzer node
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 256; // You can adjust this value to change the frequency resolution

  // Create canvas context for visualization
  var ctx = visualization.getContext('2d');
  const devicePixelRatio = window.devicePixelRatio || 1;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  // Connect analyzer to audio context destination
  analyser.connect(audioContext.destination);

  // Visualization function
  function visualize() {
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    const glimmers = useGlimmers();
    const histogram = useHistogram();
    const testChart = useTestChart();

    function render() {    
      analyser.getByteFrequencyData(dataArray);
      updateCanvasContext(ctx);
      ctx.clearRect(0, 0, visualization.width, visualization.height);

      // PLACE VISUALIZATION CODE HERE ----------------------------------------------

      glimmers.drawFrame(ctx, visualization.width, visualization.height);
      histogram.drawFrame(ctx, visualization.width, visualization.height, dataArray);

      // ----------------------------------------------------------------------------

      requestAnimationFrame(render);
    }

    render();
  }


  audioInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    var reader = new FileReader();

    reader.onload = function () {
      audioContext.decodeAudioData(reader.result, function (buffer) {
        var source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(analyser);
        source.start();
      });
    };
    reader.readAsArrayBuffer(file);
  });


  startButton.addEventListener('click', function () {
    audioContext.resume().then(function () {
      audioInput.click(); // Trigger file input click programmatically
    });
  });

  visualize();
};