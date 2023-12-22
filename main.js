import useGlimmers from './programs/useGlimmers/index.js';
import useHistogram from './programs/useHistogram.js';
import useTestChart from './programs/useTestChart.js';
import useTransientDetector from './utils/useTransientDetector.js';
import useFrequencyUtils from './utils/useFrequency.js';

// Options
let showFrameRate = true; // enable while developing to see if your program is efficient enough

// Constants
const FPS_THRESHOLD = 40;

function getQueryParam(name) {
  var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
  if (results == null) {
      return null;
  }
  return decodeURI(results[1]) || 0;
}

function updateQueryParam() {
  var program = document.getElementById("program").value;
  var url = window.location.protocol + "//" + window.location.host + window.location.pathname + '?program=' + program;
  window.history.pushState({path:url},'',url);
}

window.onload = function () {
  var program = getQueryParam('program');
  if (program) {
      document.getElementById("program").value = program;
  }

  var audioInput = document.getElementById('audioInput');
  var programSelect = document.getElementById('program');
  var visualization = document.getElementById('visualization');

  // Create audio context and analyzer node
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 256; // You can adjust this value to change the frequency resolution

  var ctx = visualization.getContext('2d');
  const devicePixelRatio = window.devicePixelRatio || 1;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  analyser.connect(audioContext.destination);

  // ***** Initialize Programs Here *****
  
  const glimmers = useGlimmers(0, 0, audioContext.sampleRate);
  const histogram = useHistogram(); 
  const testChart = useTestChart();
  
  // ************************************

  function visualize() {

    let lastWidth = 0;
    let lastHeight = 0;
    let lastFrameTime = Date.now();

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

    var bufferLength = analyser.frequencyBinCount;
    var frequencyData = new Uint8Array(bufferLength);

    function render() {
      analyser.getByteFrequencyData(frequencyData);
      updateCanvasContext(ctx);
      ctx.clearRect(0, 0, visualization.width, visualization.height);

      // ******** Render Program Frames Here **********

      switch (program) {
        case 'glimmers':
          glimmers.drawFrame(ctx, visualization.width, visualization.height, frequencyData);    
          break;
        case 'histogram':
          histogram.drawFrame(ctx, visualization.width, visualization.height, frequencyData);
          break;
        case 'test-chart':
        default:
          testChart.drawFrame(ctx, visualization.width, visualization.height, frequencyData);
          break;
      }

      // **********************************************

      if (showFrameRate) {
        const now = Date.now();
        const dt = now - lastFrameTime;
        lastFrameTime = now;
        const fps = 1000 / dt;
        ctx.fillStyle = fps > FPS_THRESHOLD ? 'green' : 'red';
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

  programSelect.addEventListener('change', function (e) {
    updateQueryParam();
  });

  visualize();
};

window.addEventListener('keydown', function(event) {
  console.log('ass');
  if (event.key === '.') {    
    const uiDiv = document.querySelector('.ui');
    uiDiv.classList.toggle('hidden');
    showFrameRate = !showFrameRate;
  }
});
