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
            if (textAreaElement.value.trim()) {
                continueButtonElement.removeAttribute('disabled');
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

    function showConversation() {
        flexContainer.innerHTML = `
            ${backButton.outerHTML}
            <button>🎤 Record conversation</button>
            ${commonTextAreaSection("Your dictated text will appear here...")}
        `;

        reattachBackButtonEventListener();
        enableContinueIfNotEmpty();
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
};
