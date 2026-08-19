/* ==========================================================
   AI Chat Studio
   script.js
   Part 1 - Configuration & Global Variables
========================================================== */

/* ===========================
   Backend URL
=========================== */

const API_URL = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "/api";

/* ===========================
   Authentication
=========================== */

let token = localStorage.getItem("token") || "";
let currentChatId = null;

/* ===========================
   DOM Elements
=========================== */

const messages = document.getElementById("messages");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("send");
const typing = document.querySelector(".typing");

const historyContainer = document.querySelector(".chat-history");
const newChatBtn = document.querySelector(".new-chat");

const searchInput = document.querySelector(".search input");
const themeBtn = document.getElementById("theme");

/* ===========================
   Time
=========================== */

function currentTime() {

    return new Date().toLocaleTimeString([], {

        hour: "2-digit",
        minute: "2-digit"

    });

}

/* ===========================
   Scroll
=========================== */

function scrollBottom() {

    messages.scrollTop = messages.scrollHeight;

}

/* ===========================
   Typing Animation
=========================== */

function showTyping() {

    typing.style.display = "flex";

    scrollBottom();

}

function hideTyping() {

    typing.style.display = "none";

}

/* ===========================
   Toast Notification
=========================== */

function showToast(text) {

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerText = text;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

/* ===========================
   Authorization Header
=========================== */

function authHeaders() {

    return {

        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"

    };

}

/* ===========================
   Logout
=========================== */

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";

}

/* ===========================
   Theme
=========================== */

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {

    document.body.classList.add("light");

}

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {

        localStorage.setItem("theme", "light");

    }

    else {

        localStorage.setItem("theme", "dark");

    }

});

/* ===========================
   Message Components
=========================== */

function createUserMessage(text) {

    messages.insertAdjacentHTML(

        "beforeend",

        `
<div class="message user fade-in">

    <div class="bubble">

        <h4>You</h4>

        <p>${text}</p>

        <span>${currentTime()}</span>

    </div>

    <img src="https://ui-avatars.com/api/?name=You">

</div>
`

    );

    scrollBottom();

}

function createAIMessage(text) {

    messages.insertAdjacentHTML(

        "beforeend",

        `
<div class="message ai fade-in">

<img src="https://ui-avatars.com/api/?name=AI&background=7F5AF0&color=fff">

<div class="bubble">

<h4>AI Assistant</h4>

<p>${text}</p>

<span>${currentTime()}</span>

</div>

</div>
`

    );

    scrollBottom();

}

/* ===========================
   Load Current User
=========================== */

async function loadProfile() {

    if (!token) {

        logout();

        return;

    }

    try {

        const response = await fetch(

            `${API_URL}/auth/me`,

            {

                headers: {

                    Authorization: `Bearer ${token}`

                }

            }

        );

        if (!response.ok) {

            logout();

            return;

        }

        const user = await response.json();

        const profileName = document.getElementById("profileName");
        const profileEmail = document.getElementById("profileEmail");

        if (profileName)
            profileName.innerText = user.username;

        if (profileEmail)
            profileEmail.innerText = user.email;

    }

    catch {

        showToast("Cannot connect to backend.");

    }

}

/* ===========================
   Start
=========================== */

hideTyping();

loadProfile();
/* ==========================================================
   AI Chat Studio
   Part 2 - Chat Management
========================================================== */

/* ===========================
   Load All Chats
=========================== */

async function loadChats() {

    try {

        const response = await fetch(

            `${API_URL}/chat/`,

            {

                headers: authHeaders()

            }

        );

        if (!response.ok) {

            showToast("Unable to load chats.");

            return;

        }

        const chats = await response.json();

        renderChatList(chats);

    }

    catch (error) {

        console.error(error);

        showToast("Server connection failed.");

    }

}

/* ===========================
   Render Chat List
=========================== */

function renderChatList(chats) {

    historyContainer.innerHTML = "";

    chats.forEach(chat => {

        const item = document.createElement("div");

        item.className = "chat-item";

        if (chat.id === currentChatId) {

            item.classList.add("active");

        }

        item.innerHTML = `

            <i class="fa-solid fa-message"></i>

            <span>${chat.title}</span>

        `;

        item.onclick = () => {

            currentChatId = chat.id;

            loadMessages(chat.id);

            renderChatList(chats);

        };

        historyContainer.appendChild(item);

    });

}

/* ===========================
   Create New Chat
=========================== */

async function createChat() {

    try {

        const response = await fetch(

            `${API_URL}/chat/new`,

            {

                method: "POST",

                headers: authHeaders(),

                body: JSON.stringify({

                    title: "New Chat"

                })

            }

        );

        if (!response.ok) {

            showToast("Cannot create chat.");

            return;

        }

        const chat = await response.json();

        currentChatId = chat.id;

        await loadChats();

        await loadMessages(chat.id);

        showToast("New chat created.");

    }

    catch (error) {

        console.error(error);

        showToast("Server error.");

    }

}

/* ===========================
   Delete Chat
=========================== */

async function deleteChat(chatId) {

    if (!confirm("Delete this chat?")) return;

    try {

        const response = await fetch(

            `${API_URL}/chat/${chatId}`,

            {

                method: "DELETE",

                headers: authHeaders()

            }

        );

        if (!response.ok) {

            showToast("Unable to delete.");

            return;

        }

        messages.innerHTML = "";

        currentChatId = null;

        loadChats();

        showToast("Chat deleted.");

    }

    catch (error) {

        console.error(error);

    }

}

/* ===========================
   Rename Chat
=========================== */

async function renameChat(chatId) {

    const title = prompt("Enter new chat title");

    if (!title) return;

    try {

        const response = await fetch(

            `${API_URL}/chat/${chatId}`,

            {

                method: "PUT",

                headers: authHeaders(),

                body: JSON.stringify({

                    title: title

                })

            }

        );

        if (!response.ok) {

            showToast("Rename failed.");

            return;

        }

        loadChats();

        showToast("Chat renamed.");

    }

    catch (error) {

        console.error(error);

    }

}

/* ===========================
   Search Chats
=========================== */

searchInput.addEventListener("keyup", () => {

    const keyword = searchInput.value.toLowerCase();

    document.querySelectorAll(".chat-item").forEach(item => {

        const text = item.innerText.toLowerCase();

        item.style.display = text.includes(keyword)

            ? "flex"

            : "none";

    });

});

/* ===========================
   Sidebar Buttons
=========================== */

newChatBtn.addEventListener(

    "click",

    createChat

);

/* ===========================
   Quick Actions
=========================== */

const exportBtn = document.querySelector(".quick-actions button:nth-child(1)");

const deleteBtn = document.querySelector(".quick-actions button:nth-child(2)");

const duplicateBtn = document.querySelector(".quick-actions button:nth-child(3)");

if (deleteBtn) {

    deleteBtn.onclick = () => {

        if (currentChatId) {

            deleteChat(currentChatId);

        }

    };

}

if (duplicateBtn) {

    duplicateBtn.onclick = () => {

        if (currentChatId) {

            renameChat(currentChatId);

        }

    };

}

/* ===========================
   Load Chats on Startup
=========================== */

if (token) {

    loadChats();

}
/* ==========================================================
   AI Chat Studio
   Part 3 - Messaging & Gemini AI
========================================================== */

/* ===========================
   Load Messages
=========================== */

async function loadMessages(chatId) {

    try {

        const response = await fetch(

            `${API_URL}/chat/${chatId}/messages`,

            {

                headers: authHeaders()

            }

        );

        if (!response.ok) {

            if (response.status === 404) {
                currentChatId = null;
                localStorage.removeItem("chat_id");
                messages.innerHTML = "";
                showToast("That chat no longer exists. Create a new chat.");
            }
            else {
                showToast("Unable to load messages.");
            }

            return;

        }

        const data = await response.json();

        messages.innerHTML = "";

        data.forEach(msg => {

            if (msg.sender === "user") {

                createUserMessage(msg.message);

            }

            else {

                createAIMessage(msg.message);

            }

        });

        scrollBottom();

    }

    catch (error) {

        console.error(error);

        showToast("Failed to load messages.");

    }

}

/* ===========================
   Send Message
=========================== */

async function sendMessage() {

    const text = messageInput.value.trim();

    if (text === "") return;

    if (!currentChatId) {

        showToast("Create a chat first.");

        return;

    }

    createUserMessage(text);

    messageInput.value = "";

    showTyping();

    try {

        const response = await fetch(

            `${API_URL}/chat/${currentChatId}/messages`,

            {

                method: "POST",

                headers: authHeaders(),

                body: JSON.stringify({

                    message: text

                })

            }

        );

        hideTyping();

        if (!response.ok) {

            let detail = "Server error.";
            try {
                const errorData = await response.json();
                detail = errorData.detail || detail;
            }
            catch {
                // Keep the fallback message when the server returns no JSON.
            }
            createAIMessage(detail);

            return;

        }

        const data = await response.json();

        /*
            Backend returns:

            [
                user_message,
                assistant_message
            ]
        */

        if (data.length > 1) {

            createAIMessage(data[1].message);

        }

        else {

            createAIMessage("No AI response received.");

        }

        scrollBottom();

    }

    catch (error) {

        hideTyping();

        console.error(error);

        createAIMessage("Cannot connect to backend.");

    }

}

/* ===========================
   Send Button
=========================== */

sendBtn.addEventListener(

    "click",

    sendMessage

);

/* ===========================
   Enter Key
=========================== */

messageInput.addEventListener(

    "keydown",

    function(event) {

        if (

            event.key === "Enter"

            &&

            !event.shiftKey

        ) {

            event.preventDefault();

            sendMessage();

        }

    }

);

/* ===========================
   Auto Resize Textarea
=========================== */

messageInput.addEventListener(

    "input",

    () => {

        messageInput.style.height = "50px";

        messageInput.style.height =

            messageInput.scrollHeight + "px";

    }

);

/* ===========================
   Auto Scroll
=========================== */

const observer = new MutationObserver(() => {

    scrollBottom();

});

observer.observe(

    messages,

    {

        childList: true

    }

);

/* ===========================
   Empty Chat Message
=========================== */

if (messages.children.length === 0) {

    createAIMessage(

        "Hello 👋\n\nHow can I help you today?"

    );

}
/* ==========================================================
   AI Chat Studio
   Part 4 - UI Features
========================================================== */

/* ===========================
   Voice Recognition
=========================== */

const micButton = document.querySelector(
    ".chat-input button:nth-child(4)"
);

if ("webkitSpeechRecognition" in window) {

    const recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    micButton.addEventListener("click", () => {

        recognition.start();

        showToast("🎤 Listening...");

    });

    recognition.onresult = function(event) {

        messageInput.value =

            event.results[0][0].transcript;

        messageInput.focus();

        showToast("Voice captured");

    };

    recognition.onerror = function() {

        showToast("Voice recognition failed");

    };

}

else {

    micButton.disabled = true;

}

/* ===========================
   Emoji Button
=========================== */

const emojiButton = document.querySelector(
    ".chat-input button:nth-child(2)"
);

const emojis = [

    "😀",
    "😂",
    "😍",
    "😊",
    "😎",
    "🤖",
    "❤️",
    "👍",
    "🔥",
    "🚀"

];

emojiButton.addEventListener("click", () => {

    const emoji =

        emojis[

            Math.floor(

                Math.random() * emojis.length

            )

        ];

    messageInput.value += emoji;

    messageInput.focus();

});

/* ===========================
   File Attachment
=========================== */

const attachButton = document.querySelector(
    ".chat-input button:first-child"
);

const fileInput = document.createElement("input");

fileInput.type = "file";

fileInput.hidden = true;

document.body.appendChild(fileInput);

attachButton.onclick = () => {

    fileInput.click();

};

fileInput.onchange = () => {

    if (!fileInput.files.length) return;

    const file = fileInput.files[0];

    createUserMessage(

        "📎 " + file.name

    );

    showToast(file.name + " attached");

};

/* ===========================
   Keyboard Shortcut
=========================== */

document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.key.toLowerCase() === "k") {

        e.preventDefault();

        searchInput.focus();

        showToast("Search");

    }

});

/* ===========================
   Window Resize
=========================== */

window.addEventListener("resize", () => {

    scrollBottom();

});

/* ===========================
   Welcome Message
=========================== */

window.addEventListener("load", () => {

    showToast("Welcome to AI Chat Studio");

});
/* ==========================================================
   AI Chat Studio
   Part 5 - Extra Features
========================================================== */

/* ===========================
   Export Chat
=========================== */

function exportChat() {

    let text = "";

    document.querySelectorAll(".message").forEach(msg => {

        const sender = msg.classList.contains("user")
            ? "You"
            : "AI";

        const content = msg.querySelector("p").innerText;

        text += `${sender}: ${content}\n\n`;

    });

    const blob = new Blob(

        [text],

        {

            type: "text/plain"

        }

    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "AI_Chat.txt";

    a.click();

    URL.revokeObjectURL(url);

    showToast("Chat exported.");

}

/* ===========================
   Copy Last AI Response
=========================== */

async function copyLastAIMessage() {

    const aiMessages = document.querySelectorAll(".message.ai p");

    if (aiMessages.length === 0) {

        showToast("No AI message found.");

        return;

    }

    const text = aiMessages[
        aiMessages.length - 1
    ].innerText;

    try {

        await navigator.clipboard.writeText(text);

        showToast("Copied to clipboard.");

    }

    catch {

        showToast("Copy failed.");

    }

}

/* ===========================
   Duplicate Chat
=========================== */

async function duplicateChat() {

    if (!currentChatId) {

        showToast("Select a chat first.");

        return;

    }

    const response = await fetch(

        `${API_URL}/chat/${currentChatId}/messages`,

        {

            headers: authHeaders()

        }

    );

    if (!response.ok) {

        showToast("Cannot duplicate.");

        return;

    }

    const oldMessages = await response.json();

    const create = await fetch(

        `${API_URL}/chat/new`,

        {

            method: "POST",

            headers: authHeaders(),

            body: JSON.stringify({

                title: "Copy"

            })

        }

    );

    const newChat = await create.json();

    currentChatId = newChat.id;

    for (const msg of oldMessages) {

        if (msg.sender === "user") {

            await fetch(

                `${API_URL}/chat/${currentChatId}/messages`,

                {

                    method: "POST",

                    headers: authHeaders(),

                    body: JSON.stringify({

                        message: msg.message

                    })

                }

            );

        }

    }

    await loadChats();

    await loadMessages(currentChatId);

    showToast("Chat duplicated.");

}

/* ===========================
   Clear Screen
=========================== */

function clearScreen() {

    if (!confirm("Clear current screen?"))

        return;

    messages.innerHTML = "";

    showToast("Screen cleared.");

}

/* ===========================
   Button Connections
=========================== */

const quickButtons = document.querySelectorAll(".quick-actions button");

if (quickButtons.length >= 3) {

    /* Export */

    quickButtons[0].onclick = exportChat;

    /* Delete/Clear */

    quickButtons[1].onclick = clearScreen;

    /* Duplicate */

    quickButtons[2].onclick = duplicateChat;

}

/* ===========================
   Double Click AI Message
=========================== */

messages.addEventListener(

    "dblclick",

    function(event) {

        const bubble = event.target.closest(".message.ai");

        if (!bubble) return;

        copyLastAIMessage();

    }

);

/* ===========================
   Notification
=========================== */

showToast("Extra features loaded.");
/* ==========================================================
   AI Chat Studio
   Part 6 - Final Initialization & Utilities
========================================================== */

/* ===========================
   Loading Overlay
=========================== */

function showLoading() {

    let loader = document.getElementById("loader");

    if (!loader) {

        loader = document.createElement("div");

        loader.id = "loader";

        loader.innerHTML = `

            <div class="loader-spinner"></div>

        `;

        document.body.appendChild(loader);

    }

    loader.style.display = "flex";

}

function hideLoading() {

    const loader = document.getElementById("loader");

    if (loader) {

        loader.style.display = "none";

    }

}

/* ===========================
   Global Fetch Wrapper
=========================== */

async function apiRequest(url, options = {}) {

    showLoading();

    try {

        const response = await fetch(url, options);

        hideLoading();

        return response;

    }

    catch (error) {

        hideLoading();

        console.error(error);

        showToast("Cannot connect to server.");

        throw error;

    }

}

/* ===========================
   Refresh Chats
=========================== */

function refreshChats() {

    if (token) {

        loadChats();

    }

}

/* ===========================
   Auto Refresh
=========================== */

setInterval(() => {

    if (currentChatId) {

        loadChats();

    }

}, 30000);

/* ===========================
   Logout Button
=========================== */

const logoutButton = document.querySelector(".logout-btn");

if (logoutButton) {

    logoutButton.addEventListener("click", () => {

        if (!confirm("Are you sure you want to logout?"))

            return;

        localStorage.removeItem("token");

        localStorage.removeItem("chat_id");

        window.location.href = "login.html";

    });

}

/* ===========================
   Window Online / Offline
=========================== */

window.addEventListener("offline", () => {

    showToast("No Internet Connection");

});

window.addEventListener("online", () => {

    showToast("Connected");

});

/* ===========================
   Copy Message
=========================== */

messages.addEventListener("click", (e) => {

    const bubble = e.target.closest(".bubble");

    if (!bubble) return;

    if (e.ctrlKey) {

        const text = bubble.querySelector("p").innerText;

        navigator.clipboard.writeText(text);

        showToast("Message copied.");

    }

});

/* ===========================
   Auto Focus
=========================== */

window.addEventListener("load", () => {

    messageInput.focus();

});

/* ===========================
   Prevent Empty Chats
=========================== */

newChatBtn.addEventListener("click", async () => {

    if (currentChatId === null) {

        await createChat();

    }

});

/* ===========================
   Save Current Chat
=========================== */

function saveCurrentChat() {

    if (currentChatId) {

        localStorage.setItem(

            "chat_id",

            currentChatId

        );

    }

}

/* ===========================
   Restore Current Chat
=========================== */

window.addEventListener("load", () => {

    const saved = localStorage.getItem("chat_id");

    if (saved) {

        currentChatId = parseInt(saved);

        loadMessages(currentChatId);

    }

});

/* ===========================
   Save on Change
=========================== */

window.addEventListener("beforeunload", () => {

    saveCurrentChat();

});

/* ===========================
   App Ready
=========================== */

window.addEventListener("load", async () => {

    hideTyping();

    if (token) {

        await loadProfile();

        await loadChats();

    }

    scrollBottom();

    showToast("AI Chat Studio Ready");

});
// Logout
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
});

// Profile
document.getElementById("profileBtn").addEventListener("click", () => {
    alert("Profile button clicked");
});

// Settings
document.getElementById("settingsBtn").addEventListener("click", () => {
    alert("Settings button clicked");
});

// Theme
document.getElementById("theme").addEventListener("click", () => {
    alert("Theme button clicked");
});