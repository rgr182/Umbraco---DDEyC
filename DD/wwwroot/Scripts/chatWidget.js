// chatWidget.js
document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatLoading = document.getElementById('chat-loading');
    const chatSubmitButton = document.querySelector('#chat-form button[type="submit"]');
    const threadList = document.getElementById('thread-list');

    let currentThreadId = null;
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
        .then(handleResponse)
        .then(data => {
            currentThreadId = data.threadId;
            chatMessages.innerHTML = '';
            data.messages.forEach(message => {
                addMessage(message.content, message.role);
            });
            fetchRecentThreads();
        })
        .catch(handleError)
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
            body: JSON.stringify({ threadId: currentThreadId, userMessage: message }),
        })
        .then(handleResponse)
        .then(data => {
            addMessage(data.response, 'assistant');
            fetchRecentThreads();
        })
        .catch(handleError)
        .finally(() => {
            setWaitingForResponse(false);
        });
    }

    function fetchRecentThreads() {
        fetch(`${apiBaseUrl}/api/chat/threads/recent/5`, {
            headers: {
                'Authorization': token
            }
        })
        .then(handleResponse)
        .then(threads => {
            displayRecentThreads(threads);
        })
        .catch(handleError);
    }

    function displayRecentThreads(threads) {
        threadList.innerHTML = '';
        threads.forEach(thread => {
            const li = document.createElement('li');
            li.textContent = `Conversación ${new Date(thread.lastUsed).toLocaleString()}`;
            li.onclick = () => loadThread(thread.id);
            if (thread.id === currentThreadId) {
                li.classList.add('active');
            }
            threadList.appendChild(li);
        });
    }

    function loadThread(threadId) {
        showLoading(true);
        fetch(`${apiBaseUrl}/api/chat/threads/${threadId}/messages`, {
            headers: {
                'Authorization': token
            }
        })
        .then(handleResponse)
        .then(messages => {
            currentThreadId = threadId;
            chatMessages.innerHTML = '';
            messages.forEach(message => {
                addMessage(message.content, message.role);
            });
            fetchRecentThreads(); // Update the thread list to show the active thread
        })
        .catch(handleError)
        .finally(() => {
            showLoading(false);
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

    function handleResponse(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }

    function handleError(error) {
        console.error('Error:', error);
        addErrorMessage('An error occurred. Please try again.');
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isWaitingForResponse) {
            sendMessage();
        }
    });

    startChat();
    fetchRecentThreads();
});