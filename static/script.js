const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "/login";
}

const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const historyBox = document.getElementById("history");

// Logout
document.getElementById("logout-btn").onclick = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};

// New Chat
document.getElementById("new-chat-btn").onclick = () => {
    chatBox.innerHTML = "";
};

// Format AI Response
function formatResponse(text) {

    if (!text) return "";

    return text
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n/g, "<br>");

}

// Load Chat History
async function loadHistory() {

    try {

        const response = await fetch("/ai/history", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        if (!response.ok) return;

        const chats = await response.json();

        historyBox.innerHTML = "";

        chats.reverse().forEach(chat => {

            historyBox.innerHTML += `
                <div class="history-item">
                    ${chat.question}
                </div>
            `;

        });

    } catch (err) {

        console.log(err);

    }

}

// Send Message
async function sendMessage() {

    const message = input.value.trim();

    if (message === "") return;

    chatBox.innerHTML += `
        <div class="user">
            <b>You:</b><br>${message}
        </div>
    `;

    input.value = "";

    chatBox.innerHTML += `
        <div class="bot" id="typing">
            🤖 AI is typing...
        </div>
    `;

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

        const response = await fetch("/ai/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },

            body: JSON.stringify({
                message: message
            })

        });

        const data = await response.json();

        const typing = document.getElementById("typing");

        if (typing) {
            typing.remove();
        }

        if (!response.ok) {

            chatBox.innerHTML += `
                <div class="bot">
                    ❌ ${JSON.stringify(data)}
                </div>
            `;

            return;

        }

        chatBox.innerHTML += `
            <div class="bot">
                <b>🤖 AI:</b><br><br>
                ${formatResponse(data.response)}
            </div>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

        loadHistory();

    } catch (err) {

        const typing = document.getElementById("typing");

        if (typing) {
            typing.remove();
        }

        chatBox.innerHTML += `
            <div class="bot">
                Error: ${err}
            </div>
        `;

    }

}

sendBtn.onclick = sendMessage;

input.addEventListener("keypress", function(e){

    if(e.key === "Enter"){
        sendMessage();
    }

});

loadHistory();