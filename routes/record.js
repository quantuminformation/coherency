// stored in /routes/record.js
export default (hostComponent) => {
  hostComponent.innerHTML = '';

  // Start with a template for the microphone button and a hidden textarea
  const indexHTML = `
  <h1>Voice to Text</h1>
  <button id="recordButton" class="record-button">🎙️ Start Recording</button>
  <textarea id="transcriptionTextArea" hidden></textarea>
  <div id="error" style="color: red;"></div>
  `;

  hostComponent.innerHTML = indexHTML;

  const recordButton = document.getElementById('recordButton');
  const transcriptionTextArea = document.getElementById('transcriptionTextArea');
  const errorDiv = document.getElementById('error');

  let mediaRecorder;
  let audioChunks = [];

  async function startRecording() {
    try {
      // Request permissions and start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
        if (mediaRecorder.state === 'inactive') {
          // TODO: Send audioChunks to transcription service every 2 seconds.
          // The response from the service will be appended to the textarea.
        }
      };
      mediaRecorder.start(2000); // 2 second chunks
      transcriptionTextArea.hidden = false;
      recordButton.textContent = '🎙️ Stop Recording';
    } catch (err) {
      errorDiv.textContent = 'Error accessing the microphone. Please grant permission.';
      const permissionsButton = document.createElement('button');
      permissionsButton.textContent = 'Grant Microphone Permissions';
      permissionsButton.onclick = startRecording;
      errorDiv.appendChild(permissionsButton);
    }
  }

  recordButton.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      recordButton.textContent = '🎙️ Start Recording';
    } else {
      startRecording();
    }
  });
};
