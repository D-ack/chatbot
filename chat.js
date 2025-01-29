
// Selecting all required elements
const sendMessageBtn = document.getElementById('sendMessageBtn');
const messageInput = document.getElementById('messageInput');
const messageList = document.getElementById('messageList');
const typingIndicator = document.getElementById('typingIndicator');

// Array of simple bad words (you can expand this or use a more sophisticated API)
const badWords = ["badword", "hate", "stupid", "idiot"]; 

// User avatar (this can be dynamically set or uploaded)
let userAvatar = "https://randomuser.me/api/portraits/men/1.jpg"; // Placeholder avatar

// Avatar upload handling
const avatarInput = document.getElementById('avatarInput');
avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        userAvatar = event.target.result;
        document.getElementById('userAvatarImage').src = userAvatar; // Update avatar in UI
    };
    reader.readAsDataURL(file);
});

// Function to add messages to the chat
function addMessageToChat(message, type = 'user') {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);

    messageElement.innerHTML = `
        <div class="avatar">
            <img src="${type === 'user' ? userAvatar : 'https://randomuser.me/api/portraits/men/2.jpg'}" alt="${type} Avatar" />
        </div>
        <div class="message-content">${message}</div>
    `;

    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
}

// Function to validate the user's input
function validateInput(message) {
    if (!message.trim()) {
        return "Please enter a message.";
    }
    for (let word of badWords) {
        if (message.toLowerCase().includes(word)) {
            return "Please refrain from using inappropriate language.";
        }
    }
    return null;
}

// Function to get the bot response from Dialogflow
async function getBotResponse(userMessage) {
    const apiUrl = "https://api.dialogflow.com/v1/query?v=20150910";
    const apiKey = "YOUR_DIALOGFLOW_API_KEY"; // Replace with your Dialogflow API key

    const requestBody = {
        query: userMessage,
        lang: "en",
        sessionId: "12345", // This should ideally be unique per user session
    };

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data.result.fulfillment.speech || "I'm not sure what you mean. Can you clarify?";
}

// Function to handle sending the message when the button is clicked
sendMessageBtn.addEventListener('click', () => {
    const messageText = messageInput.value.trim();
    
    // Validate the input
    const validationMessage = validateInput(messageText);
    if (validationMessage) {
        addMessageToChat(validationMessage, 'bot');
        messageInput.value = ''; 
        return; 
    }

    // Add the user's message to the chat
    addMessageToChat(messageText);
    messageInput.value = '';

    // Show typing indicator
    typingIndicator.style.display = 'block';
    setTimeout(() => {
        typingIndicator.style.opacity = 1;
    }, 500);

    // Get bot response
    setTimeout(() => {
        getBotResponse(messageText).then((botMessage) => {
            addMessageToChat(botMessage, 'bot');
            typingIndicator.style.opacity = 0;
        });
    }, 1500);
});

// Handle pressing 'Enter' to send message
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessageBtn.click(); 
    }
});

// Dark mode toggle
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
