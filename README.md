# Audio Visualizer
This is a pure-Javascript "framework" that helps you create audio visualizer programs.
At the end of the day, all it's doing is hooking up an audio file to a WebAudio graph, and passing data into an animation loop each frame. It's up to you as the programmer to use this data and draw something interesting to the canvas based on the realtime audio data.

## Getting Started
### Development setup
[Visual Studio Code](https://code.visualstudio.com/) is an excellent text editor for javascript programs. It also has a [live-preview extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server) which allows for hot-reloading of your programs while developing. You can also just open the `index.html` file and manually refresh your page each time you make a change.

### Navigating the repository
- `index.html`: The entry point of the website. Minimal structure containing a file input, button, and canvas. 
  - No modifications necessary
- `main.css`: The main style definitiions for this website.
  - No modifications necessary
- `main.js`: the entry point for the application.
  - In this file, you'll only need to import your program, initialize it, and call `drawFrame` in the animation loop. The rest is boilerplate and setup.

```js
import useMyProgram from "./programs/useMyProgram.js"

// Other code...

window.onload = function() {
  // Other code...
  
  // ***** Initialize Programs Here *****
  
  const myProgram = useMyProgram(0, 0, audioContext.sampleRate); // Your program may have different arguments
  
  // ************************************

  function render() {
    // Other code...
    
    // ******** Render Program Frames Here **********
    myProgram.drawFrame(ctx, visualization.width, visualization.height, frequencyData);
    // **********************************************
  }
}
```

- programs/
  - `useHistogram.js` an example program that renders a realtime histogram
  - `useTestChart.js` an example program that renders squares in each corner of the screen
  - `useGlimmers/index.js` a program I (eschirtz) wrote to demonstrate what's possible

You can add your own programs to this folder. The `use<program name>` naming convention is just that, a convention. But this is a nice pattern when writing programs in a functional style. It's similar to Object oriented programming but written with pure javascript functions (you'll noticed there are functions within functions, that is just to keep them scoped). 

You can write your programs in any way you'd like, they really just need to have a single function that can be called with the following arguments:
- `ctx`: Canvas Context 2d for drawing operations (your code will use this to draw to the screen)
- `width`: Current width of the canvas
- `height`: Current height of the canvas
- `frequencyData`: An array of 8-bit (0-255) integers representing the realtime frequency data (see `useHistogram`)

I'd recommend inspecting the example programs to see how these arguments can be used to create dynamic animations.

- utils/
  - `lerp.js` has utilities to help linearly interpolate between values. This let's you ease in and out amongst other things
  - `useFrequency.js` has utilities to help work with frequency data. Like returning a segment of the frequencyData array based on start and end frequencies in hertz
  - `useTransientDetector.js` helps detect transients. It's far from perfect, but it has a smoothing factor and optional gate. If this could be improved, that would really help the quality of animations. Feel free to mess around with different detection algorithms.


## Good luck!
I tried my best to make this repository realatively readable, but it's also very much just hacked together during my late night coding sessions. If you have any questions, don't hesitate to hit me up. Hope you enjoy!


## Helpful Links
- [The Canvas Element](https://www.w3schools.com/graphics/canvas_drawing.asp)
- [Canvas Rendering Context 2d](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [Web Audio Analyzer Node](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode)
- [Linear Interpolation](https://youtu.be/YJB1QnEmlTs?si=g8Wz_LmLqZ4hZW1_)
