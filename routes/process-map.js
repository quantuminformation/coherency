// Stored in /routes/process-map.js

export default (hostComponent) => {
    hostComponent.innerHTML = ''; // Clear the hostComponent

    const backButtonHTML = `<button id="goBack" class="back-button">🔙 Go Back</button>`;

    // Function to show initial choices
    function showCoherencyChoice() {
        hostComponent.innerHTML = `
            <div class="coherency-choice">
                <h2>Find COHERENCY in: (choose one)</h2>
                <button id="chooseConversation">Conversation</button>
                <button id="chooseContent">Content</button>
            </div>
        `;
        attachInitialEventListeners();
    }

    function attachInitialEventListeners() {
        document.getElementById("chooseConversation").addEventListener("click", showConversation);
        document.getElementById("chooseContent").addEventListener("click", showContent);
    }

    function enableContinueIfNotEmpty(textAreaElement, continueButtonElement) {
        // Check the content of the textarea on any input change
        textAreaElement.addEventListener("input", () => {
            if(textAreaElement.value.trim()) {
                continueButtonElement.removeAttribute('disabled');
            } else {
                continueButtonElement.setAttribute('disabled', 'true');
            }
        });
    }

    function showConversation() {
        hostComponent.innerHTML = `
            <div class="flex flex-col gap-md">
                ${backButtonHTML}
                <h2>Begin Conversation</h2>
                <textarea id="dictateToText" rows="10" cols="30" placeholder="Your dictated text will appear here..."></textarea>
                <button id="continueToSubject" disabled>Continue to SUBJECT</button>
            </div>
        `;

        // Listen for back button click
        document.getElementById("goBack").addEventListener("click", showCoherencyChoice);

        // Enable continue button if text area has content
        enableContinueIfNotEmpty(document.getElementById("dictateToText"), document.getElementById("continueToSubject"));

        document.getElementById("continueToSubject").addEventListener("click", function() {
            // Code to transition to the SUBJECT component
        });
    }

    function showContent() {
        hostComponent.innerHTML = `
            <div class="flex flex-col gap-md">
                ${backButtonHTML}
                <h2>Copy and Paste</h2>
                <textarea id="contentToPaste" rows="10" cols="30" placeholder="Paste your content here..."></textarea>
                <button id="continueToSubject" disabled>Continue to SUBJECT</button>
            </div>
        `;

        // Listen for back button click
        document.getElementById("goBack").addEventListener("click", showCoherencyChoice);

        // Enable continue button if text area has content
        enableContinueIfNotEmpty(document.getElementById("contentToPaste"), document.getElementById("continueToSubject"));

        document.getElementById("continueToSubject").addEventListener("click", function() {
            // Code to transition to the SUBJECT component
        });
    }

    // Start with initial choices
    showCoherencyChoice();
};
