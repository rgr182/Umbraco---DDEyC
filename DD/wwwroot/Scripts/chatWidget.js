document.addEventListener('DOMContentLoaded', function() {
    const chatToggle = document.getElementById('chat-toggle');
    const chatContainer = document.getElementById('chat-container');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatSubmitButton = document.querySelector('#chat-form button[type="submit"]');

    let threadId = null;
    let isWaitingForResponse = false;

    // The base URL is now available as a global variable
    const apiBaseUrl = assistantApiBaseUrl;

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
        if (!isWaitingForResponse) {
            sendMessage();
        }
    });

    async function startChat() {
        setLoading(true);
        showTypingIndicator();
        try {
            const response = await fetch(`${apiBaseUrl}/api/chat/StartChat`, { method: 'POST' });
            if (!response.ok) {
                throw new Error('Failed to start chat');
            }
            const data = await response.json();
            threadId = data.threadId;
            hideTypingIndicator();
            addMessage(data.welcomeMessage, 'bot');
        } catch (error) {
            console.error('Error starting chat:', error);
            hideTypingIndicator();
            addErrorMessage('Failed to start the chat. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';
        setLoading(true);
        showTypingIndicator();

        try {
            const response = await fetch(`${apiBaseUrl}/api/chat/Chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ threadId, userMessage: message }),
            });
            if (!response.ok) {
                throw new Error('Failed to send message');
            }
            const data = await response.json();
            hideTypingIndicator();
            addMessage(data.response, 'bot');
        } catch (error) {
            console.error('Error sending message:', error);
            hideTypingIndicator();
            addErrorMessage('Failed to send the message. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function addMessage(content, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        
        if (sender === 'bot') {
            const renderedContent = marked.parse(content);
            messageElement.innerHTML = `<span>${renderedContent}</span>`;
        } else {
            messageElement.innerHTML = `<span>${escapeHtml(content)}</span>`;
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addErrorMessage(content) {
        const errorElement = document.createElement('div');
        errorElement.classList.add('message', 'error-message');
        errorElement.innerHTML = `<span>${escapeHtml(content)}</span>`;
        chatMessages.appendChild(errorElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'bot-message', 'typing-indicator');
        typingIndicator.innerHTML = '<span><div class="typing-dots"><span></span><span></span><span></span></div></span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function setLoading(loading) {
        isWaitingForResponse = loading;
        chatSubmitButton.disabled = loading;
        chatSubmitButton.innerHTML = loading 
            ? '<div class="loading-spinner"></div>' 
            : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
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