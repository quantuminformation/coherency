// Stored in /routes/process-map.js

export default (hostComponent) => {
    hostComponent.innerHTML = ''; // Clear the hostComponent

    // HTML for the initial options
    const chooseCoherencyHTML = `
        <div class="coherency-choice">
            <h2>Find COHERENCY in: (choose one)</h2>
            <button id="chooseConversation">Conversation</button>
            <button id="chooseContent">Content</button>
        </div>
    `;

    // Inject the initial HTML into the hostComponent
    hostComponent.innerHTML = chooseCoherencyHTML;

    // Event handlers for the buttons
    document.getElementById("chooseConversation").addEventListener("click", function() {
        hostComponent.innerHTML = `
            <div>
                <h2>Begin Conversation</h2>
                <textarea id="dictateToText" rows="10" cols="30" placeholder="Your dictated text will appear here..."></textarea>
                <button id="continueToSubject">Continue to SUBJECT</button>
            </div>
        `;

        // You can now integrate any "speech-to-text" library here to fill the textarea

        document.getElementById("continueToSubject").addEventListener("click", function() {
            // Code to transition to the SUBJECT component
        });
    });

    document.getElementById("chooseContent").addEventListener("click", function() {
        hostComponent.innerHTML = `
            <div class="flex flex-col gap-md">
                <h2>Copy and Paste</h2>
                <textarea id="contentToPaste" rows="10" cols="30" placeholder="Paste your content here..."></textarea>
                <button id="continueToSubject">Continue to SUBJECT</button>
            </div>
        `;

        document.getElementById("continueToSubject").addEventListener("click", function() {
            // Code to transition to the SUBJECT component
        });
    });
};
