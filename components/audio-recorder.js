import {
  DEFAULT_LANGUAGE,
  DEFAULT_MODEL,
  DEFAULT_MULTILINGUAL,
  DEFAULT_QUANTIZED,
  DEFAULT_SAMPLING_RATE,
  DEFAULT_SUBTASK,
} from '../constants.js';
import { webmFixDuration } from '../lib/BlobFix.js';

const worker = new Worker(new URL('../worker.js', import.meta.url), {
  type: 'module',
});
/**
 * Sends audio chunks to dom event every 2 seconds
 * Displays a spectrum analyzer and a record button
 * stored in /components/audio-recorder.js
 * @param hostComponent
 */
export const AUDIO_ARRAY32_RECORDED = 'AUDIO_ARRAY32_RECORDED';
let storedAudio32Array = [];
let audioContext;
let analyser;

const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const audioSettings = stream.getAudioTracks()[0].getSettings();
const actualSampleRate = audioSettings.sampleRate;
audioContext = new AudioContext({ sampleRate: actualSampleRate });

analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

export default async (hostComponent) => {
  const combinedComponentHTML = `
        <style>
            #analyzerCanvas {
                width: 100%; 
                height: 3rem;
                display: block; 
                max-width: 800px;
            }
        </style>
        <button id="recordButton">Start Recording</button>
        <span id="durationDisplay"></span>
        <canvas id="analyzerCanvas" width="800" height="256"></canvas>
    `;
  hostComponent.innerHTML = combinedComponentHTML;

  function getMimeType() {
    const types = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', 'audio/aac'];
    for (let type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/wav';
  }

  let startTime;
  let duration = 0;
  const durationDisplay = document.getElementById('durationDisplay');

  function updateDurationDisplay() {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    durationDisplay.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      duration++;
      setTimeout(updateDurationDisplay, 1000);
    }
  }

  const canvas = document.getElementById('analyzerCanvas');
  canvas.width = hostComponent.offsetWidth;
  const canvasContext = canvas.getContext('2d');

  let mediaRecorder;
  let audioChunks = [];

  try {
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const mimeType = getMimeType();
    mediaRecorder = new MediaRecorder(stream, { mimeType });
    let startTime = Date.now();

    mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) audioChunks.push(event.data);
      if (mediaRecorder.state === 'inactive') {
        const duration = Date.now() - startTime;

        let blob = new Blob(audioChunks, { type: mimeType });

        if (mimeType === 'audio/webm') {
          blob = await webmFixDuration(blob, duration, blob.type);
        }

        audioChunks = [];

        const float32Data = await blobToFloat32Array(blob);
        playFloat32Audio(float32Data);

        worker.postMessage({
          audio: float32Data,
          model: DEFAULT_MODEL,
          multilingual: DEFAULT_MULTILINGUAL,
          quantized: DEFAULT_QUANTIZED,
          subtask: DEFAULT_SUBTASK,
          language: DEFAULT_LANGUAGE,
        });
      }
    };
    draw();
  } catch (error) {
    console.error('Error accessing the microphone:', error);
  }

  document.getElementById('recordButton').addEventListener('click', () => {
    if (mediaRecorder.state === 'inactive') {
      audioChunks = [];
      startTime = Date.now();
      mediaRecorder.start(4000);
      updateDurationDisplay();
      document.getElementById('recordButton').textContent = 'Stop Recording';
    } else {
      mediaRecorder.stop();
      duration = 0;
      document.getElementById('recordButton').textContent = 'Start Recording';
    }
  });

  function draw() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    analyser.getByteFrequencyData(dataArray);
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];
      canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
      x += barWidth + 1;
    }
    requestAnimationFrame(draw);
  }
};

function playFloat32Audio(float32Array) {
  const buffer = audioContext.createBuffer(1, float32Array.length, audioContext.sampleRate);
  buffer.copyToChannel(float32Array, 0);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();
}

async function blobToFloat32Array(blob) {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      try {
        const audioBuffer = await audioContext.decodeAudioData(event.target.result);
        const float32Array = audioBuffer.getChannelData(0);
        resolve(float32Array);
      } catch (error) {
        reject(error);
      }
    };
    fileReader.onerror = (error) => reject(new Error('File Reading Error: ' + error));
    fileReader.readAsArrayBuffer(blob);
  });
}
