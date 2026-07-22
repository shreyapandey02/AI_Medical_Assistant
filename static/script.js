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

    text = text
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?b>/gi, "**");

    return text
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n/g, "<br>")
        .replace(/^\*\s/gm, "• ");

}

async function typeMessage(element, text) {

    let formatted = formatResponse(text);

    let current = "";

    for (let i = 0; i < formatted.length; i++) {

        current += formatted.charAt(i);

        element.innerHTML = current;

        chatBox.scrollTop = chatBox.scrollHeight;

        await new Promise(resolve => setTimeout(resolve, 8));
    }

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
    <div class="history-item"
        onclick="openChat(${chat.id})">

        <span class="history-text">
            ${chat.question}
        </span>

        <button
            class="delete-btn"
            onclick="event.stopPropagation(); deleteChat(${chat.id})">
            🗑️
        </button>

    </div>
    `;
});


    } catch (err) {

        console.log(err);

    }

}

async function deleteChat(chatId) {

    const ok = confirm("Delete this chat?");

    if (!ok) return;

    try {

        const response = await fetch(`/ai/delete/${chatId}`, {

            method: "DELETE",

            headers: {
                Authorization: "Bearer " + token
            }

        });

        const data = await response.json();

        if (!response.ok) {

            alert(data.detail || "Unable to delete chat.");
            return;

        }

        loadHistory();

    } catch (err) {

        console.log(err);
        alert("Something went wrong.");

    }

}

function openChat(chatId){

    fetch("/ai/history",{
        headers:{
            Authorization:"Bearer "+token
        }
    })

    .then(res=>res.json())

    .then(chats=>{

        const chat=chats.find(c=>c.id===chatId);

        if(!chat) return;

        chatBox.innerHTML = `
        <div class="user">
            <b>You:</b><br>${chat.question}
            <div class="time">
                ${new Date(chat.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })}
            </div>
        </div>

        <div class="bot">
            <b>🤖 AI:</b><br><br>
            ${formatResponse(chat.answer)}
            <div class="time">${chat.created_at}</div>
        </div>
        `;

    });

}

// Send Message
async function sendMessage() {

    const message = input.value.trim();

    if (message === "") return;

    sendBtn.disabled = true;
    sendBtn.innerText = "Generating...";
    input.disabled = true;

    chatBox.innerHTML += `
    <div class="user">
        <b>You:</b><br>${message}
        <div class="time">${new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}</div>
    </div>
    `;

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
        
        console.log("Status:", response.status);
        console.log("Data:", data);
        console.log("Response field:", data.response);

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
                <div id="ai-response"></div>
                <div class="time">${new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                })}</div>
        </div>
        `;

        const aiBox = document.getElementById("ai-response");

        await typeMessage(aiBox, data.response);

        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
        input.disabled = false;
        input.focus();

        chatBox.scrollTop = chatBox.scrollHeight;

        loadHistory();

        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
        input.disabled = false;
        input.focus();

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

input.addEventListener("keydown", function(e) {

    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }

});

loadHistory();

input.focus();