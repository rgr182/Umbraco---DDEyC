// chatWidget.js
document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatLoading = document.getElementById('chat-loading');
    const chatSubmitButton = document.querySelector('#chat-form button[type="submit"]');

    let threadId = null;
    let isWaitingForResponse = false;
    const token = 'hardcodedtokenfordebugging'

    const apiBaseUrl = assistantApiBaseUrl;
    function startChat() {
        showLoading(true);
        fetch(`${apiBaseUrl}/api/chat/StartChat`, { 
            method: 'POST',
            headers: {
                'Authorization': token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            threadId = data.threadId;
            
            // Clear existing messages
            chatMessages.innerHTML = '';
            
            // Display message history
            data.messages.forEach(message => {
                addMessage(message.content, message.role);
            });
        })
        .catch(error => {
            console.error('Error starting chat:', error);
            addErrorMessage('Failed to start the chat. Please try again.');
        })
        .finally(() => {
            showLoading(false);
        });
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';
        setWaitingForResponse(true);

        fetch(`${apiBaseUrl}/api/chat/Chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ threadId, userMessage: message }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            addMessage(data.response, 'assistant');
        })
        .catch(error => {
            console.error('Error sending message:', error);
            addErrorMessage('Failed to send the message. Please try again.');
        })
        .finally(() => {
            setWaitingForResponse(false);
        });
    }

    function addMessage(content, role) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${role}-message`);
        
        let senderPrefix = '';
        if (role === 'user') {
            senderPrefix = '<span class="message-sender">User:</span> ';
        } else if (role === 'assistant' || role === 'bot') {
            senderPrefix = '<span class="message-sender">DDEyC:</span> ';
        }
        
        if (role === 'assistant' || role === 'bot') {
            messageElement.innerHTML = senderPrefix + marked.parse(content);
        } else {
            messageElement.innerHTML = senderPrefix + escapeHtml(content);
        }
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addErrorMessage(content) {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        errorElement.textContent = content;
        chatMessages.appendChild(errorElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showLoading(show) {
        chatLoading.style.display = show ? 'flex' : 'none';
        chatMessages.style.display = show ? 'none' : 'block';
    }

    function setWaitingForResponse(waiting) {
        isWaitingForResponse = waiting;
        chatSubmitButton.disabled = waiting;
        chatInput.disabled = waiting;
        if (waiting) {
            showTypingIndicator();
        } else {
            hideTypingIndicator();
        }
    }

    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isWaitingForResponse) {
            sendMessage();
        }
    });

    startChat();
});