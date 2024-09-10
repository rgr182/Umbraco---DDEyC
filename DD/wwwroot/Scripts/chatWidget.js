// File: wwwroot/scripts/chat-widget.js

document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    let threadId = null;

    chatToggle.addEventListener('click', () => {
        chatContainer.classList.toggle('hidden');
        if (!threadId) {
            startChat();
        }
    });

    chatClose.addEventListener('click', () => {
        chatContainer.classList.add('hidden');
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });

    async function startChat() {
        try {
            const response = await fetch('http://localhost:5153/api/chat/StartChat', { method: 'POST' });
            const data = await response.json();
            threadId = data.threadId;
            addMessage(data.welcomeMessage, 'bot');
        } catch (error) {
            console.error('Error starting chat:', error);
        }
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';

        try {
            const response = await fetch('http://localhost:5153/api/chat/Chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ threadId, userMessage: message }),
            });
            const data = await response.json();
            addMessage(data.response, 'bot');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    function addMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        if (sender === 'bot') {
            // Render Markdown for bot messages
            const renderedContent = marked.parse(content);
            messageElement.innerHTML = `<span>${renderedContent}</span>`;
        } else {
            messageElement.innerHTML = `<span>${escapeHtml(content)}</span>`;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});