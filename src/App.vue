<script lang="ts">
import { defineComponent, ref } from "vue";
import useVisualizer from "./useVisualizer";

export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    const audio = ref<HTMLAudioElement>();

    const visualizer = useVisualizer(canvas);

    function attachAudio(){
      console.log('attaching outside');
      
      visualizer.attachAudio(audio.value as HTMLAudioElement);
    }

    return {
      canvas,
      audio,
      visualizer,
      attachAudio
    };
  },
});
</script>


<template>
  <div>
    <h1>Audio Visualizer</h1>
    <button @click="attachAudio">Attach Audio</button>
    <button @click="visualizer.start({ fullscreen: true })">Launch</button>
    <canvas ref="canvas" />
    <audio ref="audio" controls crossorigin="anonymous" src="https://firebasestorage.googleapis.com/v0/b/samply-a03ff.appspot.com/o/users%2FDKiUgNbO7WUxQj7N3L9TkdUnR483%2Faudio%2Fe878ce8d-7fd5-4141-8a04-868bff64da2b%2Foutput%2Faac256k%40output.mp4?alt=media&token=826e76ff-b613-4656-8b35-64dbf407853b"></audio>
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
</style>
