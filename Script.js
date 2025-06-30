const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

let userMessage = "";

// Function to create message element 
const createMsgElement = (content, className) => {
    const div = document.createElement("div");
    div.classList.add("message", className);
    div.innerHTML = content;
    return div;
};

// Handle the form submission
const handleFormSubmit = (e) => {
    e.preventDefault(); 
    userMessage = promptInput.value.trim();

    if (!userMessage) return;

    // Create user message HTML and add it to the chat container
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);

    // Clear input
    promptInput.value = "";
};

// Listen to form submit
promptForm.addEventListener("click", handleFormSubmit);
