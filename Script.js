const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

const fileInput = document.getElementById("file-input");
const cancelFileBtn = document.getElementById("cancel-file-btn");
const filePreview = document.querySelector(".file-preview");

const arrow = document.getElementById("send-prompt-btn");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper ");

// API setup
const API_KEY = "AIzaSyCdDzUc-rM6Rqz8_A_BqWH_0OcffaEIcrY";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory = [];

// Function to create message element
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};

// Scroll to bottom
const scrollToBottom = () => chatsContainer.scrollTo({ top: chatsContainer.scrollHeight, behavior: "smooth" });

// Typing effect for bot response
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
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error.message);

        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        typingEffect(responseText, textElement, botMsgDiv);
        console.log(data);
    } catch (error) {
        console.log(error);
        textElement.textContent = "⚠️ Sorry, something went wrong!";
        botMsgDiv.classList.remove("loading");
    }
};

const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if (!userMessage) return;

    promptInput.value = "";

    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
        const botMsgHTML = `<img src="https://png.pngtree.com/png-clipart/20241223/original/pngtree-cool-blue-dragon-logo-png-image_18141282.png" class="avatar"><p class="message-text">Just a sec..</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    }, 500);
};

// Listen to form submit
// promptForm.addEventListener("submit", handleFormSubmit);
document.getElementById("send-prompt-btn").addEventListener("click", handleFormSubmit);


// ✅ File input logic
document.getElementById("add-file-btn").addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (e) {
                filePreview.src = e.target.result;
                filePreview.style.display = "block";
            };
            reader.readAsDataURL(file);
        } else {
            filePreview.src = "";
            filePreview.style.display = "none";
        }
    }
});

fileInput.addEventListener("change", () => {
  const file =fileInput.files[0];
  if(!file) return;

  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    fileInput.value = "";
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");
  }
});

// image remove button mens cancle button 
document.querySelector("#cancel-file-btn").addEventListener("click",() => {
fileUploadWrapper.classList.remove("active",  "img-attached" , "file-attached");
});