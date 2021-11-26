<script lang="ts">
import { defineComponent, ref } from "vue";
import useVisualizer from "./useVisualizer";
import helloworld from "./visualizers/helloworld";

export default defineComponent({
  setup() {
    const audioSource =
      "https://firebasestorage.googleapis.com/v0/b/samply-a03ff.appspot.com/o/users%2FbRuvm5M2dRQasSgiImVVGlHAO1g1%2Faudio%2Fd4a0f9d3-7f9f-4714-a2b3-9a6731e34df7%2Foutput%2Faac256k%40output.mp4?alt=media&token=7d7a6584-c0b9-4380-bd2b-443fab580741";
    const canvas = ref<HTMLCanvasElement>();
    const audio = ref<HTMLAudioElement>();

    const visualizer = useVisualizer(
      helloworld,
      // canvas
    );

    function attachAudio() {
      visualizer.attachAudio(audio.value as HTMLAudioElement);
    }

    return {
      audioSource,
      canvas,
      audio,
      visualizer,
      attachAudio,
    };
  },
});
</script>


<template>
  <div>
    <h1>Audio Visualizer</h1>
    <canvas ref="canvas" id="primary-canvas" />
    <button @click="attachAudio">Attach Audio</button>
    <button @click="visualizer.start()">Start</button>
    <button @click="visualizer.toggleFullscreen()">Fullscreen</button>
    <audio
      ref="audio"
      controls
      crossorigin="anonymous"
      :src="audioSource"
      style="display: block; margin: auto"
    />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

#primary-canvas {
  /* border: solid thin black; */
  display: block;
  margin: auto;
  background-color: black;
  width: 80%;
}
</style>
