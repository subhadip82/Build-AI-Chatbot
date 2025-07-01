const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
// API steup 
 const API_KEY = "AIzaSyCdDzUc-rM6Rqz8_A_BqWH_0OcffaEIcrY"; 
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

let userMessage = "";
const chatHistory =[];

// Function to create message element 
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
};
//simulate typing effect for bot responce
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent= "";
  const words = text.split(" ");
  let wordIndex = 0 ;

// set an interavl to type each word 
const typingInterval = setInterval(() => {
  if (wordIndex < words.length)  {
    textElement.textContent += (wordIndex === 0 ? "" :" ") + words[wordIndex++];
    botMsgDiv.classList.remove("loading");
  } else {
  clearInterval(typingInterval);
  }
} , 40)

}






const generateResponse = async (botMsgDiv) => {
    const textElement= botMsgDiv.querySelector(".message-text");
 chatHistory .push({
    role:"user",
    parts:[{text:userMessage}]
 });

  try{
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({contents: chatHistory})
      });
const data = await response.json();
if(!response.ok) throw new Error(data.error.message);
// process the responcccce text and display 
const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
typingEffect(responseText, textElement, botMsgDiv);
console.log(data);
  } catch{ ( error)
console.log(erroe);
  }
}






// Handle the form submission
const handleFormSubmit = (e) => {
    e.preventDefault(); 
    userMessage = promptInput.value.trim();

    if (!userMessage) return;

    promptInput.value="";

    // Create user message HTML and add it to the chat container
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);


    setTimeout(() => {
     // Create bot  message HTML and add it to the chat container  after 600sec...
    const botMsgHTML = `<img src="https://png.pngtree.com/png-clipart/20241223/original/pngtree-cool-blue-dragon-logo-png-image_18141282.png" class="avatar"><p class="message-text">Just a sec..</p>`;
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
     generateResponse(botMsgDiv);
    }, 500);

    // generateResponse(botMsgHTML);

    // Clear input
    promptInput.value = "";
};

// Listen to form submit
promptForm.addEventListener("click", handleFormSubmit);
