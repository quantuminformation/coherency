/**
 * Sends audio chunks to dom event every 2 seconds
 * Displays a spectrum analyzer and a record button
 * stored in /components/audio-recorder.js
 * @param hostComponent
 */
export const AUDIO_CHUNK_RECORDED = 'AUDIO_CHUNK_RECORDED';
export default (hostComponent) => {
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
        <canvas id="analyzerCanvas" width="800" height="256"></canvas>
    `;

  hostComponent.innerHTML = combinedComponentHTML;

  // Spectrum Analyzer Initialization
  const canvas = document.getElementById('analyzerCanvas');
  canvas.width = hostComponent.offsetWidth; // Set canvas width based on parent
  const canvasContext = canvas.getContext('2d');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  // Recording Initialization
  let mediaRecorder;
  let audioChunks = [];

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);

        // Dispatch audio chunk every 2 seconds
        const audioBlob = new Blob([event.data], { type: 'audio/wav' });
        document.body.dispatchEvent(new CustomEvent(AUDIO_CHUNK_RECORDED, { detail: audioBlob }));
      };

      draw(); // Begin the spectrum analyzer visualization
    })
    .catch((error) => {
      console.error('Error accessing the microphone:', error);
    });

  document.getElementById('recordButton').addEventListener('click', () => {
    if (mediaRecorder.state === 'inactive') {
      audioChunks = [];
      mediaRecorder.start(2000); // Start recording and emit data every 2 seconds
      document.getElementById('recordButton').textContent = 'Stop Recording';
    } else {
      mediaRecorder.stop();
      document.getElementById('recordButton').textContent = 'Start Recording';
    }
  });

  // Drawing function for the spectrum analyzer
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
