import useGlimmers from './programs/useGlimmers/index.js';
import useHistogram from './programs/useHistogram.js';
import useTestChart from './programs/useTestChart.js';
import useTransientDetector from './programs/useGlimmers/useTransientDetector.js';
import useFrequencyUtils from './programs/useGlimmers/useFrequencyUtils.js';

const showFPS = true;
const fpsThreshold = 40;

let lastWidth = 0;
let lastHeight = 0;

const transientDetector = useTransientDetector(1.5, 0.9, 0.99);
const transientDetector2 = useTransientDetector(4, 0.5, 0.99);
const transientDetector3 = useTransientDetector(1.5, 0.9, 0.99);

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

  const glimmers = useGlimmers(-100, -600);
  const glimmers2 = useGlimmers(0, -600);
  const glimmers3 = useGlimmers(100, -600);
  const histogram = useHistogram();
  const testChart = useTestChart();
  const frequencyUtils = useFrequencyUtils(audioContext.sampleRate);

  document.addEventListener('click', () => {
    glimmers.trigger();
    glimmers2.trigger();
    glimmers3.trigger();
  })

  // Visualization function
  function visualize() {
    var bufferLength = analyser.frequencyBinCount;
    var frequencyData = new Uint8Array(bufferLength);

    let lastFrameTime = Date.now();

    function render() {
      analyser.getByteFrequencyData(frequencyData);
      updateCanvasContext(ctx);
      ctx.clearRect(0, 0, visualization.width, visualization.height);

      // PLACE VISUALIZATION CODE HERE ----------------------------------------------

      if(transientDetector.detect(frequencyUtils.getRange(frequencyData, 0, 100))) {
        glimmers.trigger();
      }

      if(transientDetector2.detect(frequencyUtils.getRange(frequencyData, 100, 4000))) {
        glimmers2.trigger();
      }

      if(transientDetector3.detect(frequencyUtils.getRange(frequencyData, 4000, 20000))) {
        glimmers3.trigger();
      }

      glimmers.drawFrame(ctx, visualization.width, visualization.height, frequencyData);
      glimmers2.drawFrame(ctx, visualization.width, visualization.height, frequencyData);
      glimmers3.drawFrame(ctx, visualization.width, visualization.height, frequencyData);
      histogram.drawFrame(ctx, visualization.width, visualization.height, frequencyData);

      // ----------------------------------------------------------------------------

      if (showFPS) {
        const now = Date.now();
        const dt = now - lastFrameTime;
        lastFrameTime = now;
        const fps = 1000 / dt;
        ctx.fillStyle = fps > fpsThreshold ? 'green' : 'red';
        ctx.fillRect(0, visualization.height - 52, 132, 52);

        ctx.fillStyle = 'white';
        ctx.font = '24px monospace';
        ctx.fillText(`FPS: ${Math.round(fps)}`, 16, visualization.height - 16);
      }

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