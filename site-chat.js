import { playhtml } from "/playhtml-init.js";

const MAX_MESSAGES = 100;

const toggle = document.getElementById("site-chat-toggle");
const panel = document.getElementById("site-chat-panel");
const list = document.getElementById("site-chat-messages");
const form = document.getElementById("site-chat-form");
const nameInput = document.getElementById("site-chat-name");
const textInput = document.getElementById("site-chat-input");

if (toggle && panel && list && form && nameInput && textInput) {
    toggle.addEventListener("click", () => {
        const willOpen = panel.hidden;
        panel.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) {
            list.scrollTop = list.scrollHeight;
            textInput.focus();
        }
    });

    let chat = null;

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!chat) return; // not connected yet

        const text = textInput.value.trim().slice(0, 280);
        if (!text) return;

        const name = nameInput.value.trim().slice(0, 24);
        if (name) playhtml.users.me.name = name;

        chat.setData((draft) => {
            draft.messages.push({
                name: name || "anon",
                color: playhtml.users.me.color,
                text,
                ts: Date.now(),
            });
            const overflow = draft.messages.length - MAX_MESSAGES;
            if (overflow > 0) draft.messages.splice(0, overflow);
        });

        textInput.value = "";
    });

    function render(data) {
        list.innerHTML = "";
        if (!data.messages.length) {
            const empty = document.createElement("p");
            empty.className = "site-chat-message site-chat-empty";
            empty.textContent = "say hi";
            list.appendChild(empty);
        }
        for (const msg of data.messages) {
            const row = document.createElement("p");
            row.className = "site-chat-message";
            const sender = document.createElement("span");
            sender.className = "site-chat-sender";
            sender.style.color = msg.color;
            sender.textContent = msg.name + ": ";
            row.appendChild(sender);
            row.appendChild(document.createTextNode(msg.text));
            list.appendChild(row);
        }
        list.scrollTop = list.scrollHeight;
    }

    playhtml.ready
        .then(() => {
            nameInput.value = playhtml.users.me.name ?? "";
            chat = playhtml.createPageData("site-chat-messages", { messages: [] });
            chat.onUpdate(render);
            render(chat.getData());
        })
        .catch((err) => {
            console.error("[site-chat] failed to connect:", err);
            list.innerHTML = "";
            const errEl = document.createElement("p");
            errEl.className = "site-chat-message site-chat-empty";
            errEl.textContent = "chat unavailable";
            list.appendChild(errEl);
        });
}
