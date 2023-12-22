/**
 * Utilities to work with frequency data
 * @param {*} sampleRate 
 * @returns 
 */
export default function useFrequencyUtils(sampleRate, fftSize) {

  /**
   * Returns a slice of the frequency data array
   * @param {*} frequencyData 
   * @param {*} startFrequency 
   * @param {*} endFrequency 
   * @returns 
   */
  function getRange(frequencyData, startFrequency, endFrequency) {
    const totalBins = frequencyData.length;  
    const startIndex = Math.floor((startFrequency / sampleRate) * totalBins);
    const endIndex = Math.floor((endFrequency / sampleRate) * totalBins);
  
    return frequencyData.slice(startIndex, endIndex + 1);  
  }

  function hzToMel(hz) {
    return 1127 * Math.log(1 + (hz / 700));
  }

  function melToHz(mel) {
    return 700 * (Math.exp(mel / 1127) - 1);
  }

  function linearSpace(start, end, count) {
    // Include start and end points
    const delta = (end - start) / (count - 1);
    const out = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      out[i] = start + delta * i;
    }
    return out;
  }

  function calculateFftFreqs(sampleRate, nFft) {
    return linearSpace(0, sampleRate / 2, (nFft % 2 === 0) ? nFft / 2 : Math.floor(1 + nFft / 2));
  }

  function calculateMelFreqs(nMels, fMin, fMax) {
    const melMin = hzToMel(fMin);
    const melMax = hzToMel(fMax);
    // Construct linearly spaced array of nMel intervals
    const mels = linearSpace(melMin, melMax, nMels);
    const hzs = mels.map((mel) => melToHz(mel));
    return hzs;
  }

  function internalDiff(arr) {
    const out = new Float32Array(arr.length - 1);
    for (let i = 0; i < arr.length; i++) {
      out[i] = arr[i + 1] - arr[i];
    }
    return out;
  }
  
  function outerSubtract(arr, arr2) {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      out[i] = new Float32Array(arr2.length);
    }
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        out[i][j] = arr[i] - arr2[j];
      }
    }
    return out;
  }

  function createMelFilterbank() {
    const fMin = 0
    const fMax = sampleRate / 2;
    const nMels = 128;
    const nFft = fftSize;

    const fftFreqs = calculateFftFreqs(sampleRate, nFft);
    const melFreqs = calculateMelFreqs(nMels + 2, fMin, fMax);

    // console.log(melFreqs.length)
    console.log(fftFreqs.length)

    const melDif = internalDiff(melFreqs);
    const ramps = outerSubtract(melFreqs, fftFreqs);

    const filterSize = ramps[0].length;
    // console.log(filterSize)

    const weights = [];
    for (let i = 0; i < nMels; i++) {
      weights[i] = new Float32Array(filterSize);
      for (let j = 0; j < ramps[i].length; j++) {
        const lower = -ramps[i][j] / melDif[i];
        const upper = ramps[i + 2][j] / melDif[i + 1];
        const weight = Math.max(0, Math.min(lower, upper));
        weights[i][j] = weight;
      }
    }

    for (let i = 0; i < weights.length; i++) {
      const enorm = 2.0 / (melFreqs[i + 2] - melFreqs[i]);
      weights[i] = weights[i].map((val) => val * enorm);
    }

    return weights;
  }

  function applyWindow(buffer, win) {
    if (buffer.length !== win.length) {
      console.error(`Buffer length ${buffer.length} != window length ${win.length}.`);
      return null;
    }
  
    const out = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      out[i] = win[i] * buffer[i];
    }
    return out;
  }

  function applyFilterbank(mags, filterbank) {
    if (mags.length !== filterbank[0].length) {
      throw new Error(`Each entry in filterbank should have dimensions matching FFT. |mags| = ${mags.length}, |filterbank[0]| = ${filterbank[0].length}.`);
    }

    // Apply each filter to the whole FFT signal to get one value.
    const out = new Float32Array(filterbank.length);
    for (let i = 0; i < filterbank.length; i++) {
      // To calculate filterbank energies we multiply each filterbank with the
      // power spectrum.
      const win = applyWindow(mags, filterbank[i]);
      // Then add up the coefficents.
      out[i] = win.reduce((a, b) => a + b);
    }
    return out;
  }

  const melBasis = createMelFilterbank(); // Re-use the same filterbank

  function melSpectrogram(frequencyData) {
    return applyFilterbank(frequencyData, melBasis);
  }

  return {
    getRange,
    melSpectrogram
  }
}