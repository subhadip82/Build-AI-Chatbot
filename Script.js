const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const fileInput = document.getElementById("file-input");
const cancelFileBtn = document.getElementById("cancel-file-btn");
const filePreview = document.querySelector(".file-preview");

const arrow = document.getElementById("send-prompt-btn");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");

// API setup
const API_KEY = "AIzaSyCdDzUc-rM6Rqz8_A_BqWH_0OcffaEIcrY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userData = { message: "", file: {} };
const chatHistory = [];

// Create message element
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Scroll to bottom
const scrollToBottom = () => chatsContainer.scrollTo({ top: chatsContainer.scrollHeight, behavior: "smooth" });

// Typing effect
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    const typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            botMsgDiv.classList.remove("loading");
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
        }
    }, 40);
};

const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");

    // Prepare parts array
    const parts = [];
    if (userData.message) {
        parts.push({ text: userData.message });
    }
    if (userData.file.data) {
        parts.push({
            inline_data: {
                mime_type: userData.file.mime_type,
                data: userData.file.data
            }
        });
    }

    chatHistory.push({
        role: "user",
        parts: parts
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].content.parts[0].text.trim();
        typingEffect(responseText, textElement, botMsgDiv);

        chatHistory.push({ role: "model", parts: [{ text: responseText }] });

        console.log(chatHistory);
    } catch (error) {
        console.log(error);
        textElement.textContent = "⚠️ Sorry, something went wrong!";
        botMsgDiv.classList.remove("loading");
    } finally {
        userData.file = {};
    }
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    const message = promptInput.value.trim();
    if (!message && !userData.file.data) return;

    promptInput.value = "";
    userData.message = message;

    // Add user message element
    const userMsgHTML = `<p class="message-text"></p>
    ${userData.file.data ? (userData.file.isImage ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />` : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`) : ""}`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = message;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    // Bot typing
    setTimeout(() => {
        const botMsgHTML = `<img src="https://png.pngtree.com/png-clipart/20241223/original/pngtree-cool-blue-dragon-logo-png-image_18141282.png" class="avatar"><p class="message-text">Just a sec..</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);

        // Reset file after sending
        fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
        filePreview.src = "";
        userData.file = {};
    }, 500);
};

// Listen to button click
document.getElementById("send-prompt-btn").addEventListener("click", handleFormSubmit);

// File upload logic
document.getElementById("add-file-btn").addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
        fileInput.value = "";
        const base64String = e.target.result.split(",")[1];
        filePreview.src = e.target.result;
        fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");

        // Store file data
        userData.file = {
            fileName: file.name,
            data: base64String,
            mime_type: file.type,
            isImage
        };
    };
});

// Cancel file
document.getElementById("cancel-file-btn").addEventListener("click", () => {
    fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
    filePreview.src = "";
    userData.file = {};
});
