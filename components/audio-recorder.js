export default (hostComponent) => {
    const audioRecorderHTML = `
        <button id="startRecording">Start Recording</button>
        <button id="stopRecording" disabled>Stop Recording</button>
    `;

    hostComponent.innerHTML = audioRecorderHTML;

    let mediaRecorder;
    const audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                // Dispatch each chunk immediately for transcription
                document.body.dispatchEvent(new CustomEvent('audio-chunk', {
                    detail: event.data,
                }));
            };

            document.getElementById("startRecording").addEventListener("click", () => {
                mediaRecorder.start(2000);
                document.getElementById("stopRecording").disabled = false;
            });

            document.getElementById("stopRecording").addEventListener("click", () => {
                mediaRecorder.stop();
                document.getElementById("stopRecording").disabled = true;
            });
        })
        .catch(error => {
            console.error("Error accessing the microphone:", error);
        });
};
