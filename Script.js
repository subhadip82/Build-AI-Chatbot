const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const fileInput = document.getElementById("file-input");
const cancelFileBtn = document.getElementById("cancel-file-btn");
const filePreview = document.querySelector(".file-preview");

const arrow = document.getElementById("send-prompt-btn");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");
const micBtn = document.getElementById("microphonr-voice-btn");

// API setup
const API_KEY = "AIzaSyCqMG6MmxAFvKc0vpGVcgCDHpmBkNogAlk";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let typingInterval, controller;
let userData = { message: "", file: {} };
const chatHistory = [];

const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

const scrollToBottom = () => chatsContainer.scrollTo({ top: chatsContainer.scrollHeight, behavior: "smooth" });

const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    typingInterval = setInterval(() => {
        if (wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
            scrollToBottom();
        } else {
            clearInterval(typingInterval);
            botMsgDiv.classList.remove("loading");
            document.body.classList.remove("bot-responding");
        }
    }, 40);
};

const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");
    controller = new AbortController();

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

    chatHistory.push({ role: "user", parts });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: chatHistory }),
            signal: controller.signal
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
        document.body.classList.remove("bot-responding");
    } finally {
        userData.file = {};
    }
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    const message = promptInput.value.trim();
    if (!message && !userData.file.data || document.body.classList.contains("bot-responding")) return;

    promptInput.value = "";
    userData.message = message;

    document.body.classList.add("bot-responding", "chats-active");
    fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");

    const userMsgHTML = `<p class="message-text"></p>
    ${userData.file.data ? (userData.file.isImage ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />` : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`) : ""}`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = message;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
        const botMsgHTML = `<img src="https://i.ibb.co/B5Nc15Th/1f700d8b2c3dc40bbcaeeb59d046bc74-1-removebg-preview.png" class="avatar"><p class="message-text">Just a sec..</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);

        fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
        filePreview.src = "";
        userData.file = {};
    }, 500);
};

document.getElementById("add-file-btn").addEventListener("click", () => {
    fileInput.click();
});

//  Add voice-to-text logic
let recognition;
let isListening = false;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        micBtn.classList.add("listening");
    };

    recognition.onend = () => {
        micBtn.classList.remove("listening");
        isListening = false;

        // Submit if text exists
        if (promptInput.value.trim()) {
            promptForm.requestSubmit();
        }
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        promptInput.value = transcript;
    };

    micBtn.addEventListener("click", () => {
        if (!isListening) {
            recognition.start();
            isListening = true;
        } else {
            recognition.stop();
        }
    });
} else {
    micBtn.disabled = true;
    micBtn.title = "Speech Recognition not supported in this browser";
}

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

        userData.file = {
            fileName: file.name,
            data: base64String,
            mime_type: file.type,
            isImage
        };
    };
});

cancelFileBtn.addEventListener("click", () => {
    fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
    filePreview.src = "";
    userData.file = {};
});

document.getElementById("stop-response-btn").addEventListener("click", () => {
    userData.file = {};
    controller?.abort();
    clearInterval(typingInterval);
    const botMsg = chatsContainer.querySelector(".bot-message.loading");
    if (botMsg) botMsg.classList.remove("loading");
    document.body.classList.remove("bot-responding");
});

document.querySelector("#delete-chats-btn").addEventListener("click", () => {
    chatHistory.length = 0;
    chatsContainer.innerHTML = "";
    document.body.classList.remove("bot-responding", "chats-active");
});

themeToggle.addEventListener('click', () => {
    const isLightTheme = document.body.classList.toggle("light-theme");
    localStorage.setItem("themecolor", isLightTheme ? "light_mode" : "dark_mode");
    themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});
const isLightTheme = localStorage.getItem("themecolor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

promptForm.addEventListener("submit", handleFormSubmit);
arrow.addEventListener("click", () => {
    promptForm.requestSubmit();
});

document.querySelectorAll(".suggestion-item").forEach(item => {
    item.addEventListener("click", () => {
        promptInput.value = item.querySelector(".text").textContent;
        document.body.classList.add("chats-active");
        promptForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
});

