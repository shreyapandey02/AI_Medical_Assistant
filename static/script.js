alert("NEW SCRIPT LOADED");

function formatResponse(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replace(/\n/g, "<br>");
}

const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

sendBtn.onclick = async () => {

    const message = input.value.trim();

    if (message === "") return;

    chatBox.innerHTML += `
        <div class="user">
            <b>You:</b> ${message}
        </div>
    `;

    input.value = "";

    const typing = document.createElement("div");
    typing.className = "bot";
    typing.id = "typing";
    typing.innerHTML = "🤖 <b>AI is typing...</b>";

    chatBox.appendChild(typing);
    chatBox.scrollTop = chatBox.scrollHeight;

    const token = localStorage.getItem("token");

    console.log("TOKEN =", token);
    console.log("Sending Authorization =", "Bearer " + token);

    try {

        const response = await fetch("/ai/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                message: message
            })
        });

        console.log("STATUS =", response.status);

        const data = await response.json();

        console.log("DATA =", data);

        document.getElementById("typing").remove();

        if (!response.ok) {

            chatBox.innerHTML += `
                <div class="bot">
                    <b>❌ Error:</b><br>
                    ${JSON.stringify(data)}
                </div>
            `;

            return;
        }

        chatBox.innerHTML += `
            <div class="bot">
                <b>🤖 AI:</b><br>
                ${formatResponse(data.response)}
            </div>
        `;

    } catch (err) {

        document.getElementById("typing").remove();

        console.error(err);

        chatBox.innerHTML += `
            <div class="bot">
                <b>❌ Error:</b><br>
                ${err}
            </div>
        `;
    }

    chatBox.scrollTop = chatBox.scrollHeight;
};

input.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendBtn.click();
    }

});