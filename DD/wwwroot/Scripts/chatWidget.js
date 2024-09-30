document.addEventListener('DOMContentLoaded', function() {
    const chatWidget = document.getElementById('chat-widget');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatLoading = document.getElementById('chat-loading');
    const chatSubmitButton = document.querySelector('#chat-form button[type="submit"]');
    const pastConversationsBtn = document.getElementById('past-conversations-btn');
    const pastConversations = document.getElementById('past-conversations');
    const conversationList = document.getElementById('conversation-list');
    const readOnlyIndicator = document.getElementById('read-only-indicator');
    const closePastConversationsBtn = document.getElementById('close-past-conversations-btn');

    let currentThreadId = null;
    let isWaitingForResponse = false;
    const token = localStorage.getItem('authToken') || '';
    let isReadOnly = false;
    let recentThreads = [];

    const apiBaseUrl = assistantApiBaseUrl;

    function togglePastConversations() {
        pastConversations.classList.toggle('hidden');
        chatWidget.querySelector('.chat-main').classList.toggle('shifted');
    }

    function setReadOnly(readonly) {
        isReadOnly = readonly;
        chatForm.style.display = readonly ? 'none' : 'flex';
        readOnlyIndicator.classList.toggle('hidden', !readonly);
        if (readonly) {
            readOnlyIndicator.textContent = "Modo de solo lectura";
        }
    }

    function startChat() {
        showLoading(true);
        fetch(`${apiBaseUrl}/api/chat/StartChat`, { 
            method: 'POST',
            headers: { 'Authorization': token }
        })
        .then(handleResponse)
        .then(data => {
            currentThreadId = data.threadId;
            chatMessages.innerHTML = '';
            data.messages.forEach(message => addMessage(message.content, message.role));
            return fetchRecentThreads();
        })
        .then(() => {
            currentThreadId= recentThreads[0].id;
            updateThreadDisplay();
        })
        .catch(handleError)
        .finally(() => showLoading(false));
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatInput.value = '';
        setWaitingForResponse(true);

        const currentThread = recentThreads.find(thread => thread.id === currentThreadId);
        if (!currentThread) {
            handleError(new Error('Current thread not found'));
            setWaitingForResponse(false);
            return;
        }

        fetch(`${apiBaseUrl}/api/chat/Chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ threadId: currentThread.threadId, userMessage: message }),
        })
        .then(handleResponse)
        .then(data => {
            addMessage(data.response, 'assistant');
            updateThreadDisplay();
        })
        .catch(handleError)
        .finally(() => setWaitingForResponse(false));
    }

    function loadThread(threadId) {
        if (threadId === currentThreadId) return;

        showLoading(true);
        fetch(`${apiBaseUrl}/api/chat/threads/${threadId}/messages`, {
            headers: { 'Authorization': token }
        })
        .then(handleResponse)
        .then(messages => {
            currentThreadId = threadId;
            chatMessages.innerHTML = '';
            messages.forEach(message => addMessage(message.content, message.role));
            updateThreadDisplay();
        })
        .catch(handleError)
        .finally(() => showLoading(false));
    }

    function fetchRecentThreads() {
        return fetch(`${apiBaseUrl}/api/chat/threads/recent/10`, {
            headers: { 'Authorization': token }
        })
        .then(handleResponse)
        .then(threads => {
            recentThreads = threads;
            updateThreadDisplay();
        })
        .catch(handleError);
    }

    function updateThreadDisplay() {
        conversationList.innerHTML = '';
        recentThreads.forEach((thread, index) => {
            const li = document.createElement('li');
            li.textContent = index === 0 ? 'Conversación Actual' : `Conversación ${new Date(thread.lastUsed).toLocaleString()}`;
            li.onclick = () => loadThread(thread.id);
            
            if (thread.id === currentThreadId) {
                li.classList.add('active');
            }

            conversationList.appendChild(li);
        });

        const isCurrentThreadMostRecent = currentThreadId === recentThreads[0]?.id;
        setReadOnly(!isCurrentThreadMostRecent);
    }

    function addMessage(content, role) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${role}-message`);
        
        let senderPrefix = '';
        if (role === 'user') {
            senderPrefix = '<span class="message-sender">Usuario:</span> ';
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
            throw new Error(response.status.toString());
        }
        return response.json();
    }

    function handleError(error) {
        console.error('Error:', error);
        let errorMessage = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';

        if (error.message) {
            switch (error.message) {
                case '401':
                    errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
                    break;
                case '403':
                    errorMessage = 'No tiene permiso para realizar esta acción.';
                    break;
                case '404':
                    errorMessage = 'No se pudo encontrar el recurso solicitado.';
                    break;
                case '500':
                    errorMessage = 'Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.';
                    break;
                case '503':
                    errorMessage = 'El servicio no está disponible en este momento. Por favor, espere unos minutos y vuelva a intentarlo.';
                    break;
            }
        }

        addErrorMessage(errorMessage);
    }

    pastConversationsBtn.addEventListener('click', togglePastConversations);
    closePastConversationsBtn.addEventListener('click', togglePastConversations);

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isWaitingForResponse && !isReadOnly) {
            sendMessage();
        }
    });

    startChat();
});