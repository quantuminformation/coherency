/**
 * This is the process map for the Coherency feature.
 * Stored in /routes/process-map.js
 * @param hostComponent
 */
import {loadAndRunComponents} from "../componentLoader.js";

export default (hostComponent) => {
    hostComponent.innerHTML = '';

    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex flex-col gap-md items-center';
    hostComponent.appendChild(flexContainer);

    const backButton = document.createElement('button');
    backButton.id = 'goBack';
    backButton.className = 'back-button';
    backButton.innerHTML = '🔙 Go Back';
    // Notice we aren't attaching the event here, we'll do it post-render.

    function commonTextAreaSection(placeholderText) {
        return `
            <textarea id="commonTextarea" rows="10" cols="30" placeholder="${placeholderText}"></textarea>
            <button id="continueToSubject" disabled>Continue to SUBJECT</button>
        `;
    }

    function enableContinueIfNotEmpty() {
        const textAreaElement = document.getElementById("commonTextarea");
        const continueButtonElement = document.getElementById("continueToSubject");

        textAreaElement.addEventListener("input", () => {
            debugger

            if (textAreaElement.value.trim()) {
                continueButtonElement.removeAttribute('disabled');

                // Call sentiment analysis upon input
                analyzeSentiment(textAreaElement.value);
            } else {
                continueButtonElement.setAttribute('disabled', 'true');
            }
        });
    }


    function reattachBackButtonEventListener() {
        const backButtonElement = document.getElementById("goBack");
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
            
            <div data-component="audio-recorder"></div>

            ${commonTextAreaSection("Your dictated text will appear here...")}
        `;

        reattachBackButtonEventListener();
        enableContinueIfNotEmpty();
        await  loadAndRunComponents(flexContainer);

    }

    function showContent() {
        flexContainer.innerHTML = `
            ${backButton.outerHTML}
            <h2>Copy and Paste</h2>
            ${commonTextAreaSection("Paste your content here...")}
        `;

        reattachBackButtonEventListener();
        enableContinueIfNotEmpty();
    }

    function attachInitialEventListeners() {
        document.getElementById("chooseConversation").addEventListener("click", showConversation);
        document.getElementById("chooseContent").addEventListener("click", showContent);
    }

    // Start with initial choices
    showCoherencyChoice();
    document.body.addEventListener('audio-chunk', event => {

        const audioChunk = event.detail;
        // Send the audioChunk for transcription
    });
};
