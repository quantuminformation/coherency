/**
 * This is the process map for the Coherency feature.
 * Stored in /routes/process-map.js
 * @param hostComponent
 */
import { loadAndRunComponents } from '../componentLoader.js';
import { AUDIO_ARRAY32_RECORDED } from '../components/audio-recorder.js';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_MODEL,
  DEFAULT_MULTILINGUAL,
  DEFAULT_QUANTIZED,
  DEFAULT_SAMPLING_RATE,
  DEFAULT_SUBTASK,
} from '../constants.js';

const worker = new Worker(new URL('../worker.js', import.meta.url), {
  type: 'module',
});

worker.addEventListener('message', (event) => {
  const { status, task, data, file, progress } = event.data;

  if (status === 'update' && task === 'automatic-speech-recognition') {
    const textAreaElement = document.getElementById('commonTextarea');
    if (textAreaElement) {
      textAreaElement.value += data.text; // Append the transcribed text
    }
  } else if (status === 'progress') {
    console.log(`Model: ${file}, Progress: ${progress}%`); // Log the model download progress
  } else if (status === 'error') {
    console.error('Transcription error:', data);
  }
});
export default (hostComponent) => {
  hostComponent.innerHTML = '';

  const flexContainer = document.createElement('div');
  flexContainer.className = 'flex flex-col gap-md items-center';
  hostComponent.appendChild(flexContainer);

  const backButton = document.createElement('button');
  backButton.id = 'goBack';
  backButton.className = 'back-button';
  backButton.innerHTML = '🔙 Go Back';

  function commonTextAreaSection(placeholderText) {
    return `
            <textarea id="commonTextarea" rows="30" style="width:100%;"  placeholder="${placeholderText}"></textarea>
            <button id="continueToSubject" disabled>Continue to SUBJECT</button>
        `;
  }

  function enableContinueIfNotEmpty() {
    const textAreaElement = document.getElementById('commonTextarea');
    const continueButtonElement = document.getElementById('continueToSubject');

    textAreaElement.addEventListener('input', () => {
      if (textAreaElement.value.trim()) {
        continueButtonElement.removeAttribute('disabled');
        // Call sentiment analysis upon input (assuming this function exists elsewhere in your code)
        analyzeSentiment(textAreaElement.value);
      } else {
        continueButtonElement.setAttribute('disabled', 'true');
      }
    });
  }

  function reattachBackButtonEventListener() {
    const backButtonElement = document.getElementById('goBack');
    if (backButtonElement) {
      backButtonElement.addEventListener('click', showCoherencyChoice);
    }
  }

  function showCoherencyChoice() {
    flexContainer.innerHTML = `
            <h2>Find COHERENCY in: (choose one)</h2>
            <div class="flex gap-md">
                <button id="chooseConversation">Conversation</button>
                <button id="chooseContent">Content</button>
            </div>
        `;

    attachInitialEventListeners();
  }

  async function showConversation() {
    flexContainer.innerHTML = `
            ${backButton.outerHTML}
            ${commonTextAreaSection('Your dictated text will appear here...')}
            <div data-component="audio-recorder" class="flex flex-col items-center gap-md"></div>
        `;

    reattachBackButtonEventListener();
    enableContinueIfNotEmpty();
    await loadAndRunComponents(flexContainer);
  }

  function showContent() {
    flexContainer.innerHTML = `
            ${backButton.outerHTML}
            <h2>Copy and Paste</h2>
            ${commonTextAreaSection('Paste your content here...')}
        `;

    reattachBackButtonEventListener();
    enableContinueIfNotEmpty();
  }

  function attachInitialEventListeners() {
    document.getElementById('chooseConversation').addEventListener('click', showConversation);
    document.getElementById('chooseContent').addEventListener('click', showContent);
  }

  // Start with initial choices
  showCoherencyChoice();

  document.body.addEventListener(AUDIO_ARRAY32_RECORDED, async (event) => {
    const audioChunk = event.detail;
    const data = await getAudioFromRecording(audioChunk);
  });
};

const getAudioFromRecording = async (data) => {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(data);
    const fileReader = new FileReader();

    fileReader.onprogress = (event) => {
      console.log(event.loaded / event.total || 0);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };

    fileReader.onloadend = async () => {
      try {
        const audioCTX = new AudioContext({
          sampleRate: DEFAULT_SAMPLING_RATE,
        });
        const arrayBuffer = fileReader.result;
        const decoded = await audioCTX.decodeAudioData(arrayBuffer);

        resolve({
          buffer: decoded,
          url: blobUrl,
          mimeType: data.type,
        });
      } catch (error) {
        reject(error);
      }
    };

    fileReader.readAsArrayBuffer(data);
  });
};
