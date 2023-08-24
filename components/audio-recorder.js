// Stored in /components/audio-recorder.js

export default (hostComponent) => {
    // Clear any existing content in the hostComponent
    hostComponent.innerHTML = '';

    let isRecording = false;
    let recorder;
    let audioChunks = [];

    const handleRecording = () => {
        const btn = hostComponent.querySelector("#recording-btn");
        if (isRecording) {
            recorder.stop();
            btn.textContent = 'Start Recording';
            isRecording = false;
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
                audioChunks = [];
                recorder = new MediaRecorder(stream);

                recorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                recorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks);
                    hostComponent.dispatchEvent(new CustomEvent("audio-recorded", { detail: audioBlob }));
                    audioChunks = [];
                };

                recorder.start(2000);
                btn.textContent = 'Stop Recording';
                isRecording = true;
            });
        }
    };

    //@language=HTML
    const audioRecorderHTML = `
    <style>
      /* Style for your audio recorder button */
      #recording-btn {
        background-color: #ff5959;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      #recording-btn:hover {
        background-color: #ff2f2f;
      }
    </style>

    <div>
      <button id="recording-btn" onclick="handleRecording()">Start Recording</button>
    </div>
  `;

    // Append the new content to the hostComponent
    hostComponent.innerHTML = audioRecorderHTML;

    // Attach event listeners after the HTML is rendered.
    hostComponent.querySelector("#recording-btn").addEventListener('click', handleRecording);
};
