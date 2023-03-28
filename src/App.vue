<template>
  <div>
    <div class="container">
      <canvas ref="canvas" />
    </div>
    <button @click="visualizer.start()">Start</button>
    <button @click="visualizer.toggleFullscreen()">Fullscreen</button>
    <audio
      ref="audio"
      controls
      crossorigin="anonymous"
      :src="audioSource"
      style="display: block; margin: auto"
    />
    <select name="pets" id="pet-select" v-model="selectedDevice">
      <option
        v-for="device in audioInputDevices"
        :key="device.deviceId"
        :value="device.deviceId"
      >
        {{ device.label }}
      </option>
    </select>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, watch } from "vue";
import useVisualizer from "./useVisualizer";
import cucumber from "./visualizers/cucumber";
import canyon from "./visualizers/canyon";

const audioSource =
  "https://firebasestorage.googleapis.com/v0/b/samply-a03ff.appspot.com/o/users%2FbRuvm5M2dRQasSgiImVVGlHAO1g1%2Faudio%2Fd4a0f9d3-7f9f-4714-a2b3-9a6731e34df7%2Foutput%2Faac256k%40output.mp4?alt=media&token=7d7a6584-c0b9-4380-bd2b-443fab580741";
const canvas = ref<HTMLCanvasElement>();
const audio = ref<HTMLAudioElement>();

const visualizer = useVisualizer(canyon, canvas);

const selectedDevice = ref("");
watch(selectedDevice, (value, prev) => {
  if (value === prev) return;
  console.log("Changing input device", value);
  getAudioInput();
});

const audioInputDevices = ref<MediaDeviceInfo[]>([]);
navigator.mediaDevices.enumerateDevices().then(devices => {
  devices.forEach(device => {
    if (device.kind === "audioinput") {
      audioInputDevices.value.push(device);
      console.log(device.kind, device.label, device.deviceId);
    }
  });
});

function getInputFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("deviceId") as string;
}

let audioContext: AudioContext;
function getAudioInput() {
  if (audioContext) audioContext.close();
  const deviceId = selectedDevice.value
    ? selectedDevice.value
    : getInputFromURL();
  navigator.mediaDevices
    .getUserMedia({
      audio: { deviceId }
    })
    .then(stream => {
      audioContext = new AudioContext();
      const streamNode = audioContext.createMediaStreamSource(stream);
      window.history.replaceState({}, "", `/?deviceId=${deviceId}`);
      visualizer.connect(streamNode);
      visualizer.start();
    });
}

getAudioInput();
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  margin: 0;
}

.container {
  position: relative;
  /* padding-top: 56.25%; 16:9 Aspect Ratio (divide 9 by 16 = 0.5625) */
  width: 100%;
  height: 100vh;
}

.container canvas {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: black;
}

:fullscreen {
  display: block !important;
  cursor: none;
}

:-webkit-full-screen {
  width: 100%;
  height: 100%;
  display: block !important;
  cursor: none;
}
</style>
