document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const chatWidget = document.getElementById('chat-widget');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatLoading = document.getElementById('chat-loading');
    const chatSubmitButton = document.querySelector('#chat-form button[type="submit"]');
    const pastConversationsBtn = document.getElementById('past-conversations-btn');
    const pastConversations = document.getElementById('past-conversations');
    const conversationList = document.getElementById('conversation-list');
    const chatStatus = document.getElementById('chat-status');
    const statusIcon = chatStatus.querySelector('.status-icon');
    const statusText = chatStatus.querySelector('.status-text');
    const typingIndicator = document.querySelector('.typing-indicator');
    const errorIndicator = document.querySelector('.error-indicator');
    const closePastConversationsBtn = document.getElementById('close-past-conversations-btn');

    // State
    let currentConversationId = null;
    let isWaitingForResponse = false;
    let isProcessing = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000;
    const tokenObj = JSON.parse(localStorage.getItem('authToken') || '{}');
    const token = tokenObj.token || '';
    let isReadOnly = false;
    let recentConversations = [];

    const apiBaseUrl = assistantApiBaseUrl;

    // Status Management
    function updateStatus(type, message) {
        chatStatus.className = 'chat-status';
        statusIcon.textContent = '';

        switch(type) {
            case 'processing':
                chatStatus.classList.add('processing');
                statusIcon.textContent = 'sync';
                break;
            case 'error':
                chatStatus.classList.add('error');
                statusIcon.textContent = 'error_outline';
                break;
            case 'success':
                chatStatus.classList.add('success');
                statusIcon.textContent = 'check_circle';
                break;
            case 'busy':
                chatStatus.classList.add('processing');
                statusIcon.textContent = 'hourglass_empty';
                break;
        }

        statusText.textContent = message;
        chatStatus.classList.remove('hidden');

        if (type === 'success') {
            setTimeout(() => chatStatus.classList.add('hidden'), 3000);
        }
    }

    function updateUIState() {
        const isDisabled = isWaitingForResponse || isReadOnly || isProcessing;
        chatInput.disabled = isDisabled;
        chatSubmitButton.disabled = isDisabled;
        
        typingIndicator.classList.toggle('hidden', !isWaitingForResponse);
        errorIndicator.classList.toggle('hidden', !isProcessing);
        
        chatInput.placeholder = isProcessing ? 'Procesando mensaje anterior...' : 
            isWaitingForResponse ? 'Esperando respuesta...' : 
            isReadOnly ? 'Modo solo lectura' : 
            'Escribe tu mensaje aquí...';
    }

    function setProcessing(processing) {
        isProcessing = processing;
        updateUIState();
        if (processing) {
            updateStatus('processing', 'Procesando mensaje...');
        } else {
            chatStatus.classList.add('hidden');
        }
    }

    function setWaitingForResponse(waiting) {
        isWaitingForResponse = waiting;
        updateUIState();
        if (waiting) {
            showTypingIndicator();
        } else {
            hideTypingIndicator();
        }
    }

    function setReadOnly(readonly) {
        isReadOnly = readonly;
        updateUIState();
    }

    function showLoading(show) {
        chatLoading.style.display = show ? 'flex' : 'none';
        chatMessages.style.display = show ? 'none' : 'block';
    }
    function addMessage(content, role) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${role}-message`);
        
        const senderElement = document.createElement('div');
        senderElement.classList.add('message-sender');
        senderElement.textContent = role === 'user' ? 'Usuario' : 'DDEyC';
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        
        if (role === 'assistant') {
            // Sanitize and render markdown
            const sanitizedContent = DOMPurify.sanitize(marked.parse(content));
            contentElement.innerHTML = sanitizedContent;
        } else {
            contentElement.textContent = content;
        }
        
        messageElement.appendChild(senderElement);
        messageElement.appendChild(contentElement);
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }

    function addSystemMessage(content, type = 'error') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'system-message', type);
        messageElement.textContent = content;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return messageElement;
    }

    function showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('typing-indicator');
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function hideTypingIndicator() {
        const typingIndicator = chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function togglePastConversations() {
        pastConversations.classList.toggle('hidden');
        chatWidget.querySelector('.chat-main').classList.toggle('shifted');
    }

    async function handleResponse(response) {
        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || response.statusText;
            } catch {
                errorMessage = response.statusText;
            }
            throw new Error(errorMessage);
        }
        return response.json();
    }

    function handleError(error) {
        let errorMessage = 'Ha ocurrido un error. Por favor, inténtelo de nuevo.';
        let statusMessage = 'Error al procesar el mensaje';

        if (error.message) {
            switch (error.message) {
                case '401':
                    errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
                    statusMessage = 'Sesión expirada';
                    break;
                case '403':
                    errorMessage = 'No tiene permiso para realizar esta acción.';
                    statusMessage = 'Acceso denegado';
                    break;
                case '404':
                    errorMessage = 'No se pudo encontrar el recurso solicitado.';
                    statusMessage = 'Recurso no encontrado';
                    break;
                case '409':
                    errorMessage = 'Esta conversación está ocupada. Por favor, espere.';
                    statusMessage = 'Conversación ocupada';
                    break;
                case '500':
                    errorMessage = 'Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.';
                    statusMessage = 'Error del servidor';
                    break;
                case '503':
                    errorMessage = 'El servicio no está disponible en este momento. Por favor, espere unos minutos.';
                    statusMessage = 'Servicio no disponible';
                    break;
                default:
                    if (error.message.includes('CONVERSATION_BUSY') || 
                        error.message.includes('PROCESSING_IN_PROGRESS')) {
                        errorMessage = 'Esta conversación está ocupada. Por favor, espere.';
                        statusMessage = 'Conversación ocupada';
                    } else {
                        errorMessage = error.message;
                        statusMessage = 'Error desconocido';
                    }
            }
        }

        updateStatus('error', statusMessage);
        addSystemMessage(errorMessage);
        console.error('Chat error:', error);
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || isWaitingForResponse || isReadOnly || isProcessing) {
            return;
        }

        try {
            setProcessing(true);
            const currentConversation = recentConversations.find(c => c.id === currentConversationId);
            if (!currentConversation) {
                throw new Error('Current conversation not found');
            }

            const messageText = message;
            chatInput.value = '';
            
            // Add message to UI optimistically
            const messageElement = addMessage(messageText, 'user');
            
            let success = false;
            let retryAttempt = 0;

            while (retryAttempt < MAX_RETRIES && !success) {
                try {
                    setWaitingForResponse(true);
                    
                    const response = await fetch(`${apiBaseUrl}${assistantChatEndpoint}`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': token
                        },
                        body: JSON.stringify({ 
                            threadId: currentConversation.threadId, 
                            userMessage: messageText 
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        if (response.status === 409 || 
                            data.error === "CONVERSATION_BUSY" || 
                            data.error === "PROCESSING_IN_PROGRESS") {
                            updateStatus('busy', 'Esta conversación está ocupada. Por favor, espere...');
                            messageElement.remove();
                            return;
                        }
                        throw new Error(response.status.toString());
                    }

                    addMessage(data.response, 'assistant');
                    await updateConversationDisplay();
                    updateStatus('success', 'Mensaje enviado correctamente');
                    success = true;

                } catch (error) {
                    retryAttempt++;
                    if (retryAttempt === MAX_RETRIES) {
                        throw error;
                    }
                    updateStatus('processing', `Reintentando enviar mensaje (${retryAttempt}/${MAX_RETRIES})...`);
                    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
                }
            }

        } catch (error) {
            handleError(error);
            // Remove the optimistically added message on error
            const lastMessage = chatMessages.querySelector('.user-message:last-child');
            if (lastMessage) {
                lastMessage.remove();
            }
        } finally {
            setWaitingForResponse(false);
            setProcessing(false);
        }
    }

    async function startChat() {
        showLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}${assistantStartChatEndpoint}`, { 
                method: 'POST',
                headers: { 'Authorization': token }
            });
            
            const data = await handleResponse(response);
            currentConversationId = data.threadId;
            chatMessages.innerHTML = '';
            data.messages.forEach(message => addMessage(message.content, message.role.toLowerCase()));
            
            await fetchRecentConversations();
            
            if (recentConversations.length > 0) {
                currentConversationId = recentConversations[0].id;
                updateConversationDisplay();
            }
            
            updateStatus('success', 'Conversación iniciada');
        } catch (error) {
            handleError(error);
        } finally {
            showLoading(false);
        }
    }

    async function loadThread(threadId) {
        if (threadId === currentConversationId) return;

        showLoading(true);
        try {
            const response = await fetch(
                `${apiBaseUrl}${assistantGetMessageEndpointStart}${threadId}${assistantGetMessageEndpointContinue}`, 
                { headers: { 'Authorization': token } }
            );
            
            const messages = await handleResponse(response);
            currentConversationId = threadId;
            chatMessages.innerHTML = '';
            messages.forEach(message => addMessage(message.content, message.role.toLowerCase()));
            updateConversationDisplay();
            updateStatus('success', 'Conversación cargada');
        } catch (error) {
            handleError(error);
        } finally {
            showLoading(false);
        }
    }

    async function fetchRecentConversations() {
        try {
            const response = await fetch(`${apiBaseUrl}${assistantRecentThreadsEndpoint}`, {
                headers: { 'Authorization': token }
            });
            
            const threads = await handleResponse(response);
            recentConversations = threads;
            updateConversationDisplay();
        } catch (error) {
            handleError(error);
            return [];
        }
    }

    function updateConversationDisplay() {
        conversationList.innerHTML = '';
        recentConversations.forEach((conversation, index) => {
            const li = document.createElement('li');
            li.textContent = index === 0 ? 'Conversación Actual' : 
                `Conversación ${new Date(conversation.lastUsed).toLocaleString()}`;
            li.onclick = () => loadThread(conversation.id);
            
            if (conversation.id === currentConversationId) {
                li.classList.add('active');
            }

            conversationList.appendChild(li);
        });

        const isCurrentConversationMostRecent = currentConversationId === recentConversations[0]?.id;
        setReadOnly(!isCurrentConversationMostRecent);
    }
    // Event Listeners
    pastConversationsBtn.addEventListener('click', togglePastConversations);
    closePastConversationsBtn.addEventListener('click', togglePastConversations);

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!isWaitingForResponse && !isReadOnly && !isProcessing) {
            sendMessage();
        }
    });

    // Input event listeners for better UX
    chatInput.addEventListener('keydown', (e) => {
        // Allow submitting with Enter (but not with Shift+Enter for newlines)
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isWaitingForResponse && !isReadOnly && !isProcessing) {
                sendMessage();
            }
        }
    });

    // Add paste event listener to sanitize pasted content
    chatInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    // Focus handling
    chatInput.addEventListener('focus', () => {
        chatForm.classList.add('focused');
    });

    chatInput.addEventListener('blur', () => {
        chatForm.classList.remove('focused');
    });

    // Window visibility handling
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Refresh conversations when tab becomes visible
            fetchRecentConversations();
        }
    });

    // Error boundary for unexpected errors
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        updateStatus('error', 'Ha ocurrido un error inesperado');
        addSystemMessage('Ha ocurrido un error inesperado. Por favor, recargue la página.');
    });

    // Automatic retry for network issues
    window.addEventListener('online', () => {
        updateStatus('success', 'Conexión restaurada');
        if (currentConversationId) {
            fetchRecentConversations();
        }
    });

    window.addEventListener('offline', () => {
        updateStatus('error', 'Sin conexión');
        addSystemMessage('Se ha perdido la conexión a Internet. Reconectando...');
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (isProcessing || isWaitingForResponse) {
            return "Hay un mensaje en proceso. ¿Seguro que desea salir?";
        }
    });

    // Mobile keyboard handling
    if ('visualViewport' in window) {
        window.visualViewport.addEventListener('resize', () => {
            // Scroll to bottom when mobile keyboard appears/disappears
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    // Handle back button for conversation history
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.conversationId) {
            loadThread(event.state.conversationId);
        }
    });

    // Initialize markdown options
    marked.setOptions({
        gfm: true,
        breaks: true,
        sanitize: false, // We're using DOMPurify instead
        smartLists: true,
        smartypants: true,
        highlight: function(code, lang) {
            return code;
        }
    });

    // Initialize DOMPurify options
    DOMPurify.setConfig({
        ALLOWED_TAGS: [
            'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
            'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'target', 'class', 'id'],
        ALLOW_DATA_ATTR: false,
        ADD_ATTR: [['target', '_blank']], // Open links in new tab
        USE_PROFILES: {html: true}
    });

    // Initialize the chat
    startChat();

    // Keep session alive // Every 5 minutes
});