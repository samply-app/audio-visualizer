let lastWidth = 0;
let lastHeight = 0;
function updateCanvasContext(context) {
  const canvas = context.canvas;
  const newWidth = canvas.clientWidth * devicePixelRatio;
  const newHeight = canvas.clientHeight * devicePixelRatio;
  if(lastWidth !== newWidth || lastHeight !== newHeight) {
    canvas.width = newWidth;
    canvas.height = newHeight;  
    lastWidth = newWidth;
    lastHeight = newHeight;        
  }  
  return canvas;
}

window.onload = function() {
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
  // Upscale the visualization canvas to account for extra pixel density
  const devicePixelRatio = window.devicePixelRatio || 1;
  // visualization.width = visualization.offsetWidth * devicePixelRatio;
  // visualization.height = visualization.offsetHeight * devicePixelRatio;
  ctx.scale(devicePixelRatio, devicePixelRatio);

  // Connect analyzer to audio context destination
  analyser.connect(audioContext.destination);

  // Visualization function
  function visualize() {
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);

      function draw() {
          analyser.getByteFrequencyData(dataArray);          

          ctx.clearRect(0, 0, visualization.width, visualization.height);          
          updateCanvasContext(ctx);
          var barWidth = (visualization.width / bufferLength);
          var barHeight;
          var x = 0;

          for (var i = 0; i < bufferLength; i++) {
              barHeight = (dataArray[i] / 255) * visualization.height;
              ctx.fillStyle = 'rgba(255,50,50,' + (barHeight / 255) + ')';
              ctx.fillRect(x, visualization.height - barHeight, barWidth, barHeight);
              x += barWidth + 1;
          }

          ctx.fillStyle = 'rgba(255,0,255,0.5)';
          ctx.fillRect(0, 0, 100, 100);
          ctx.fillRect(visualization.width - 100, 0, 100, 100);
          ctx.fillRect(0, visualization.height - 100, 100, 100);
          ctx.fillRect(visualization.width - 100, visualization.height - 100, 100, 100);

          requestAnimationFrame(draw);
      }

      draw();
  }

  // Handle file input change
  audioInput.addEventListener('change', function(e) {
      var file = e.target.files[0];
      var reader = new FileReader();

      reader.onload = function() {
          audioContext.decodeAudioData(reader.result, function(buffer) {
              // Create audio source
              var source = audioContext.createBufferSource();
              source.buffer = buffer;

              // Connect source to analyzer
              source.connect(analyser);

              // Start playing
              source.start();
              
              // Connect analyzer to visualizer
              visualize();
          });
      };

      reader.readAsArrayBuffer(file);
  });

  // Handle start button click
  startButton.addEventListener('click', function() {
      audioContext.resume().then(function() {
          audioInput.click(); // Trigger file input click programmatically
      });
  });
};