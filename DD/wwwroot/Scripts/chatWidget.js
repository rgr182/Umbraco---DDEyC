// Core chat widget namespace
const ChatWidget = {
  initialize() {
    return this.UI.initialize()
      .then(() => this.State.initialize())
      .then(() => this.setupDependencies())
      .then(() => this.ConversationManager.startChat())
      .catch((error) => {
        this.ErrorHandler.handle(error);
      });
  },

  setupDependencies() {
    return new Promise((resolve) => {
      const checkDeps = () => {
        if (window.authHandler && window.marked && window.DOMPurify) {
          this.setupMarkdownAndPurify();
          resolve();
        } else {
          setTimeout(checkDeps, 100);
        }
      };
      checkDeps();
    });
  },

  setupMarkdownAndPurify() {
    marked.setOptions({
      gfm: true,
      breaks: true,
      sanitize: false,
      smartLists: true,
      smartypants: true,
    });

    DOMPurify.setConfig({
      ALLOWED_TAGS: [
        "p",
        "br",
        "b",
        "i",
        "em",
        "strong",
        "a",
        "ul",
        "ol",
        "li",
        "code",
        "pre",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "hr",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ],
      ALLOWED_ATTR: ["href", "target", "class", "id"],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: [["target", "_blank"]],
      USE_PROFILES: { html: true },
    });
  },
};

ChatWidget.UI = {
  elements: {},

  async initialize() {
    this.cacheElements();
    this.setupEventListeners();
    return Promise.resolve();
  },

  cacheElements() {
    this.elements = {
      widget: document.getElementById("chat-widget"),
      form: document.getElementById("chat-form"),
      input: document.getElementById("chat-input"),
      messages: document.getElementById("chat-messages"),
      loading: document.getElementById("chat-loading"),
      submitButton: document.querySelector('#chat-form button[type="submit"]'),
      pastConversationsBtn: document.getElementById("past-conversations-btn"),
      pastConversations: document.getElementById("past-conversations"),
      conversationList: document.getElementById("conversation-list"),
      favoritesList: document.getElementById("favorites-list"),
      status: {
        container: document.getElementById("chat-status"),
        icon: document.querySelector("#chat-status .status-icon"),
        text: document.querySelector("#chat-status .status-text"),
      },
      indicators: {
        typing: document.querySelector(".typing-indicator"),
        error: document.querySelector(".error-indicator"),
      },
      closePastConversationsBtn: document.getElementById(
        "close-past-conversations-btn"
      ),
      noteModal: document.getElementById("note-modal"),
      noteInput: document.getElementById("note-input"),
    };
  },

  setupEventListeners() {
    // Form events
    this.elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (
        !ChatWidget.State.get("isWaitingForResponse") &&
        !ChatWidget.State.get("isReadOnly") &&
        !ChatWidget.State.get("isProcessing")
      ) {
        ChatWidget.MessageManager.sendMessage();
      }
    });

    // Input events
    this.elements.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (
          !ChatWidget.State.get("isWaitingForResponse") &&
          !ChatWidget.State.get("isReadOnly") &&
          !ChatWidget.State.get("isProcessing")
        ) {
          ChatWidget.MessageManager.sendMessage();
        }
      }
    });

    this.elements.input.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });

    // Navigation events
    this.elements.pastConversationsBtn.addEventListener("click", () => {
      this.elements.pastConversations.classList.toggle("hidden");
      this.elements.widget
        .querySelector(".chat-main")
        .classList.toggle("shifted");
    });

    this.elements.closePastConversationsBtn.addEventListener("click", () => {
      this.elements.pastConversations.classList.toggle("hidden");
      this.elements.widget
        .querySelector(".chat-main")
        .classList.toggle("shifted");
    });

    // Window events
    window.addEventListener("online", () => {
      this.updateStatus("success", "Conexión restaurada");
      if (ChatWidget.State.get("currentConversationId")) {
        ChatWidget.ConversationManager.fetchRecentConversations();
      }
    });

    window.addEventListener("offline", () => {
      this.updateStatus("error", "Sin conexión");
      this.addSystemMessage(
        "Se ha perdido la conexión a Internet. Reconectando..."
      );
    });

    window.addEventListener("beforeunload", (e) => {
      if (
        ChatWidget.State.get("isProcessing") ||
        ChatWidget.State.get("isWaitingForResponse")
      ) {
        e.returnValue = "Hay un mensaje en proceso. ¿Seguro que desea salir?";
        return e.returnValue;
      }
    });

    if ("visualViewport" in window) {
      window.visualViewport.addEventListener("resize", () => {
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
      });
    }
  },

  updateStatus(type, message) {
    this.elements.status.container.className = "chat-status";
    this.elements.status.icon.textContent = "";

    const iconMap = {
      processing: "sync",
      error: "error_outline",
      success: "check_circle",
      busy: "hourglass_empty",
    };

    this.elements.status.icon.textContent = iconMap[type] || "";
    this.elements.status.container.classList.add(
      type === "busy" ? "processing" : type
    );
    this.elements.status.text.textContent = message;
    this.elements.status.container.classList.remove("hidden");

    if (type === "success") {
      setTimeout(
        () => this.elements.status.container.classList.add("hidden"),
        3000
      );
    }
  },

  updateUIState() {
    const state = ChatWidget.State.data;
    const isDisabled =
      state.isWaitingForResponse ||
      state.isReadOnly ||
      state.isProcessing ||
      state.currentView === "favorites";

    this.elements.input.disabled = isDisabled;
    this.elements.submitButton.disabled = isDisabled;

    // Update placeholder text based on state
    if (state.currentView === "favorites") {
      this.elements.input.placeholder =
        "No se pueden enviar mensajes en la vista de favoritos";
    } else if (state.isProcessing) {
      this.elements.input.placeholder = "Procesando mensaje anterior...";
    } else if (state.isWaitingForResponse) {
      this.elements.input.placeholder = "Esperando respuesta...";
    } else if (state.isReadOnly) {
      this.elements.input.placeholder = "Modo solo lectura";
    } else {
      this.elements.input.placeholder = "Escribe tu mensaje aquí...";
    }
  },

  showLoading(show) {
    this.elements.loading.style.display = show ? "flex" : "none";
    this.elements.messages.style.display = show ? "none" : "block";
  },

  addSystemMessage(content, type = "error") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "system-message", type);
    messageElement.textContent = content;
    this.elements.messages.appendChild(messageElement);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    return messageElement;
  },

  showTypingIndicator() {
    const existingIndicators =
      this.elements.messages.querySelectorAll(".typing-indicator");
    existingIndicators.forEach((indicator) => indicator.remove());

    const indicator = document.createElement("div");
    indicator.classList.add("typing-indicator");
    indicator.innerHTML = `
          <div>
              <span class="message-sender">MarkBot</span>
          </div>
          <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
          </div>
      `;

    this.elements.messages.appendChild(indicator);
    this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
  },

  hideTypingIndicator() {
    const existingIndicators =
      this.elements.messages.querySelectorAll(".typing-indicator");
    existingIndicators.forEach((indicator) => indicator.remove());
  },
  promptForNote() {
    return new Promise((resolve) => {
        const modal = this.elements.noteModal;
        const noteInput = this.elements.noteInput;
        const confirmButton = modal.querySelector('.confirm');
        const saveWithoutNoteButton = modal.querySelector('.cancel'); // This is actually "Guardar sin nota"
        const closeButton = modal.querySelector('#button-close-note-modal');

        // Show modal
        modal.classList.remove('hidden');
        noteInput.value = ''; // Clear previous input
        noteInput.focus();

        // Handle save with note
        const handleConfirm = () => {
            const note = noteInput.value.trim();
            modal.classList.add('hidden');
            cleanup();
            resolve(note);
        };

        // Handle save without note
        const handleSaveWithoutNote = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(''); // Return empty string for saving without note
        };

        // Handle actual cancellation
        const handleCancel = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve(null); // Only return null for actual cancellation
        };

        // Handle Enter key and Escape key
        const handleKeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleConfirm();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancel();
            }
        };

        // Clean up event listeners
        const cleanup = () => {
            confirmButton.removeEventListener('click', handleConfirm);
            saveWithoutNoteButton.removeEventListener('click', handleSaveWithoutNote);
            closeButton.removeEventListener('click', handleCancel);
            noteInput.removeEventListener('keydown', handleKeydown);
            document.removeEventListener('keydown', handleKeydown);
        };

        // Add event listeners
        confirmButton.addEventListener('click', handleConfirm);
        saveWithoutNoteButton.addEventListener('click', handleSaveWithoutNote);
        closeButton.addEventListener('click', handleCancel);
        noteInput.addEventListener('keydown', handleKeydown);
        document.addEventListener('keydown', handleKeydown); // Global ESC key handling
    });
},
};
// State Management Module
ChatWidget.State = {
  data: {
    currentConversationId: null,
    isWaitingForResponse: false,
    isProcessing: false,
    isReadOnly: false,
    currentView: "messages",
    recentConversations: [],
    token: null,
    isFavoritesLoading: false,
    isRedirecting: false,
  },

  initialize() {
    this.data.token =
      JSON.parse(localStorage.getItem("authToken") || "{}").token || "";
    return Promise.resolve();
  },

  update(key, value) {
    this.data[key] = value;
    ChatWidget.UI.updateUIState();
  },

  get(key) {
    return this.data[key];
  },

  setProcessing(processing) {
    this.update("isProcessing", processing);
    if (processing) {
      ChatWidget.UI.elements.indicators.error.classList.add("visible");
    } else {
      ChatWidget.UI.elements.indicators.error.classList.remove("visible");
    }
  },

  setWaitingForResponse(waiting) {
    this.update("isWaitingForResponse", waiting);
    if (waiting) {
      ChatWidget.UI.showTypingIndicator();
    } else {
      ChatWidget.UI.hideTypingIndicator();
    }
  },

  setReadOnly(readonly) {
    this.update("isReadOnly", readonly);
  },
};

// API Module
ChatWidget.API = {
  constants: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    apiBaseUrl: assistantApiBaseUrl,
  },

  async request(endpoint, options = {}) {
    if (!window.authHandler) {
      throw new Error("Auth handler not initialized");
    }

    try {
      const response = await window.authHandler.fetch(
        `${this.constants.apiBaseUrl}${endpoint}`,
        options
      );

      return response;
    } catch (error) {
      if (error.message?.includes("HTTP error! status: 401")) {
        setTimeout(() => {
          window.location.href = loginPageRoute;
        }, 2000);
      }
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async retryOperation(operation, maxRetries = this.constants.MAX_RETRIES) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, this.constants.RETRY_DELAY * attempt)
        );
      }
    }
  },
};
// Message Manager Module
ChatWidget.MessageManager = {
  createMessage(content, role, message = {}) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${role}-message`);

    if (message.id) {
      messageElement.dataset.messageId = message.id;
    }

    const messageContent = `
          <div class="message-sender">${
            role === "user" ? "Usuario" : "DDEyC"
          }</div>
          <div class="message-content">
              ${
                role === "assistant"
                  ? DOMPurify.sanitize(marked.parse(content))
                  : content
              }
          </div>
          <div class="message-actions">
              <button class="favorite-button ${
                message.isFavorite ? "active" : ""
              }" 
                      title="Marcar como favorito">
                  <span class="material-icons">
                      ${message.isFavorite ? "star" : "star_border"}
                  </span>
              </button>
          </div>
          ${
            message.isFavorite && message.favoriteNote
              ? `<div class="favorite-note">Nota: ${message.favoriteNote}</div>`
              : ""
          }
      `;

    messageElement.innerHTML = messageContent;

    // Add favorite button handler
    const favoriteButton = messageElement.querySelector(".favorite-button");
    if (favoriteButton && message.id) {
      favoriteButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        await this.handleMessageFavorite(
          favoriteButton,
          messageElement,
          message
        );
      });
    }

    ChatWidget.UI.elements.messages.appendChild(messageElement);
    ChatWidget.UI.elements.messages.scrollTop =
      ChatWidget.UI.elements.messages.scrollHeight;
    return messageElement;
  },

  async handleMessageFavorite(button, messageElement, message) {
    try {
      const isFavorited = button.classList.contains("active");
      let note = "";

      if (!isFavorited) {
        note = await ChatWidget.UI.promptForNote();
        if (note === null) return; // User cancelled
      }

      const response = await ChatWidget.API.post(
        `/api/chat/messages/${message.id}/favorite`,
        note
      );

      if (response && response.isFavorite !== undefined) {
        this.updateMessageFavoriteUI(button, messageElement, response, note);
        ChatWidget.UI.updateStatus(
          "success",
          `Mensaje ${
            response.isFavorite ? "agregado a" : "eliminado de"
          } favoritos`
        );

        if (
          ChatWidget.State.get("currentView") === "favorites" &&
          !response.isFavorite
        ) {
          messageElement.remove();
          if (!ChatWidget.UI.elements.messages.querySelector(".message")) {
            ChatWidget.UI.addSystemMessage("No hay mensajes favoritos", "info");
          }
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      ChatWidget.ErrorHandler.handle(error);
    }
  },

  updateMessageFavoriteUI(button, messageElement, result, note) {
    button.innerHTML = `<span class="material-icons">${
      result.isFavorite ? "star" : "star_border"
    }</span>`;
    button.classList.toggle("active", result.isFavorite);

    let noteElement = messageElement.querySelector(".favorite-note");
    if (result.isFavorite && note) {
      if (!noteElement) {
        noteElement = document.createElement("div");
        noteElement.classList.add("favorite-note");
        messageElement.appendChild(noteElement);
      }
      noteElement.textContent = `Nota: ${note}`;
    } else if (noteElement) {
      noteElement.remove();
    }
  },

  async sendMessage() {
    const message = ChatWidget.UI.elements.input.value.trim();
    if (
      !message ||
      ChatWidget.State.get("isWaitingForResponse") ||
      ChatWidget.State.get("isReadOnly") ||
      ChatWidget.State.get("isProcessing")
    ) {
      return;
    }

    try {
      ChatWidget.State.setProcessing(true);
      ChatWidget.UI.elements.input.value = "";
      const messageElement = this.createMessage(message, "user", {});

      const currentConversation = ChatWidget.State.get(
        "recentConversations"
      ).find((c) => c.id === ChatWidget.State.get("currentConversationId"));

      if (!currentConversation) {
        throw new Error("Current conversation not found");
      }

      ChatWidget.State.setProcessing(false);
      ChatWidget.State.setWaitingForResponse(true);

      const data = await ChatWidget.API.post(assistantChatEndpoint, {
        threadId: currentConversation.threadId,
        userMessage: message,
      });

      this.createMessage(data.response, "assistant", {
        id: data.messageId,
        isFavorite: false,
      });

      await ChatWidget.ConversationManager.updateConversationDisplay();
      ChatWidget.UI.updateStatus("success", "Mensaje enviado correctamente");
    } catch (error) {
      ChatWidget.ErrorHandler.handle(error);
      const lastMessage = ChatWidget.UI.elements.messages.querySelector(
        ".user-message:last-child"
      );
      if (lastMessage) lastMessage.remove();
    } finally {
      ChatWidget.State.setWaitingForResponse(false);
    }
  },
};

// Conversation Manager Module
ChatWidget.ConversationManager = {
  async startChat() {
    ChatWidget.UI.showLoading(true);
    try {
      const data = await ChatWidget.API.post(assistantStartChatEndpoint);
      ChatWidget.State.update("currentConversationId", data.id);
      ChatWidget.UI.elements.messages.innerHTML = "";

      this.addMessageToolbar();

      data.messages.forEach((message) =>
        ChatWidget.MessageManager.createMessage(
          message.content,
          message.role.toLowerCase(),
          {
            id: message.id,
            isFavorite: message.isFavorite,
            favoriteNote: message.favoriteNote,
          }
        )
      );

      await this.fetchRecentConversations();
      ChatWidget.UI.updateStatus("success", "Conversación iniciada");
    } catch (error) {
      ChatWidget.ErrorHandler.handle(error);
    } finally {
      ChatWidget.UI.showLoading(false);
    }
  },

  async loadThread(threadId) {
    if (
      threadId === ChatWidget.State.get("currentConversationId") &&
      ChatWidget.State.get("currentView") === "messages"
    ) {
      return;
    }

    ChatWidget.UI.showLoading(true);
    try {
      const messages = await ChatWidget.API.get(
        `${assistantGetMessageEndpointStart}${threadId}${assistantGetMessageEndpointContinue}`
      );

      ChatWidget.State.update("currentConversationId", threadId);
      ChatWidget.State.update("currentView", "messages");
      ChatWidget.UI.elements.messages.innerHTML = "";

      messages.forEach((message) => {
        ChatWidget.MessageManager.createMessage(
          message.content,
          message.role.toLowerCase(),
          {
            id: message.id,
            isFavorite: message.isFavorite,
            favoriteNote: message.favoriteNote,
          }
        );
      });

      await this.updateConversationDisplay();
      ChatWidget.UI.updateUIState();
      ChatWidget.UI.updateStatus("success", "Conversación cargada");

      const toolbar = document.querySelector(".messages-toolbar");
      if (toolbar) {
        const allButton = toolbar.children[0];
        const favButton = toolbar.children[1];
        this.updateToolbarState(allButton, favButton);
      }
    } catch (error) {
      ChatWidget.ErrorHandler.handle(error);
    } finally {
      ChatWidget.UI.showLoading(false);
    }
  },

  addMessageToolbar() {
    const existingToolbar = document.querySelector(".messages-toolbar");
    if (existingToolbar) {
      existingToolbar.remove();
    }

    const toolbar = document.createElement("div");
    toolbar.classList.add("messages-toolbar");

    const viewAllButton = document.createElement("button");
    viewAllButton.textContent = "Hilo actual";
    viewAllButton.onclick = () => this.handleViewAllClick(viewAllButton);

    const viewFavoritesButton = document.createElement("button");
    viewFavoritesButton.textContent = "Mensajes favoritos";
    viewFavoritesButton.onclick = () =>
      this.handleViewFavoritesClick(viewFavoritesButton);

    toolbar.appendChild(viewAllButton);
    toolbar.appendChild(viewFavoritesButton);

    ChatWidget.UI.elements.messages.parentNode.insertBefore(
      toolbar,
      ChatWidget.UI.elements.messages
    );
    this.updateToolbarState(viewAllButton, viewFavoritesButton);
  },

  handleViewAllClick(viewAllButton) {
    if (
      ChatWidget.State.get("currentView") !== "messages" ||
      !ChatWidget.UI.elements.messages.querySelector(".message")
    ) {
      this.loadThread(ChatWidget.State.get("currentConversationId"));
    }
    ChatWidget.State.update("currentView", "messages");
    this.updateToolbarState(viewAllButton, viewAllButton.nextElementSibling);
  },

  handleViewFavoritesClick(viewFavoritesButton) {
    ChatWidget.FavoriteManager.showFavoriteMessages();
    ChatWidget.State.update("currentView", "favorites");
    this.updateToolbarState(
      viewFavoritesButton.previousElementSibling,
      viewFavoritesButton
    );
  },

  updateToolbarState(allButton, favoritesButton) {
    allButton.classList.toggle(
      "active",
      ChatWidget.State.get("currentView") === "messages"
    );
    favoritesButton.classList.toggle(
      "active",
      ChatWidget.State.get("currentView") === "favorites"
    );
  },

  async fetchRecentConversations() {
    try {
      const conversations = await ChatWidget.API.get(
        assistantRecentThreadsEndpoint
      );
      ChatWidget.State.update("recentConversations", conversations);
      this.updateConversationDisplay();
    } catch (error) {
      ChatWidget.ErrorHandler.handle(error);
      return [];
    }
  },

  async updateConversationDisplay() {
    const conversations = ChatWidget.State.get("recentConversations");
    ChatWidget.UI.elements.conversationList.innerHTML = "";

    conversations.forEach((conversation) => {
      const li = document.createElement("li");
      li.dataset.threadId = conversation.id;
      li.textContent = `Conversación ${new Date(
        conversation.lastUsed
      ).toLocaleString()}`;
      li.onclick = () => this.loadThread(conversation.id);

      const favoriteButton = document.createElement("button");
      favoriteButton.classList.add("conversation-favorite-button");
      favoriteButton.innerHTML = `<span class="material-icons">${
        conversation.isFavorite ? "star" : "star_border"
      }</span>`;
      if (conversation.isFavorite) favoriteButton.classList.add("active");

      favoriteButton.onclick = async (e) => {
        e.stopPropagation();
        await ChatWidget.FavoriteManager.handleThreadFavorite(
          conversation,
          favoriteButton
        );
      };

      if (conversation.id === ChatWidget.State.get("currentConversationId")) {
        li.classList.add("active");
      }

      li.appendChild(favoriteButton);
      ChatWidget.UI.elements.conversationList.appendChild(li);
    });

    const isCurrentConversationMostRecent =
      ChatWidget.State.get("currentConversationId") === conversations[0]?.id;
    ChatWidget.State.setReadOnly(!isCurrentConversationMostRecent);

    await ChatWidget.FavoriteManager.updateFavoritesDisplay();
  },
};
// Favorite Manager Module
ChatWidget.FavoriteManager = {
  async toggleThreadFavorite(threadId) {
      try {
          const note = await ChatWidget.UI.promptForNote();
          if (note === null) return false;

          const result = await ChatWidget.API.post(
              `/api/chat/threads/${threadId}/favorite`,
              note
          );

          ChatWidget.UI.updateStatus(
              'success',
              `Conversación ${result.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`
          );

          await ChatWidget.ConversationManager.updateConversationDisplay();
          return result.isFavorite;
      } catch (error) {
          ChatWidget.ErrorHandler.handle(error);
          return false;
      }
  },

  async handleThreadFavorite(conversation) {
      try {
          const note = conversation.isFavorite ? '' : await ChatWidget.UI.promptForNote();
          if (!conversation.isFavorite && note === null) return;

          const response = await ChatWidget.API.post(
              `/api/chat/threads/${conversation.id}/favorite`,
              note
          );

          if (response && response.isFavorite !== undefined) {
              // Update both regular list and favorites list
              this.updateThreadFavoriteStatus(
                  conversation.id,
                  response.isFavorite,
                  note
              );
              await this.updateFavoritesDisplay();

              ChatWidget.UI.updateStatus(
                  'success',
                  `Conversación ${response.isFavorite ? 'agregada a' : 'eliminada de'} favoritos`
              );
          }
      } catch (error) {
          ChatWidget.ErrorHandler.handle(error);
      }
  },

  updateThreadFavoriteStatus(threadId, isFavorite, note = '') {
      // Update in regular conversation list
      const regularListItem = ChatWidget.UI.elements.conversationList.querySelector(
          `li[data-thread-id="${threadId}"]`
      );
      if (regularListItem) {
          const favButton = regularListItem.querySelector('.conversation-favorite-button');
          if (favButton) {
              favButton.innerHTML = `<span class="material-icons">${
                  isFavorite ? 'star' : 'star_border'
              }</span>`;
              favButton.classList.toggle('active', isFavorite);
          }
      }

      // Update conversation in state
      const conversations = ChatWidget.State.get('recentConversations');
      const conversation = conversations.find(c => c.id === threadId);
      if (conversation) {
          conversation.isFavorite = isFavorite;
          conversation.favoriteNote = isFavorite ? note : null;
          ChatWidget.State.update('recentConversations', conversations);
      }
  },

  async showFavoriteMessages() {
      try {
          ChatWidget.State.update('isFavoritesLoading', true);
          ChatWidget.UI.showLoading(true);

          const favorites = await ChatWidget.API.get('/api/chat/favorites/messages');
          ChatWidget.UI.elements.messages.innerHTML = '';

          if (favorites.length === 0) {
              ChatWidget.UI.addSystemMessage('No hay mensajes favoritos', 'info');
              return;
          }

          favorites.forEach(message => {
              ChatWidget.MessageManager.createMessage(
                  message.content,
                  message.role.toLowerCase(),
                  {
                      id: message.id,
                      isFavorite: true,
                      favoriteNote: message.favoriteNote,
                  }
              );
          });

          ChatWidget.State.update('currentView', 'favorites');
          ChatWidget.UI.updateUIState();
      } catch (error) {
          ChatWidget.ErrorHandler.handle(error);
      } finally {
          ChatWidget.State.update('isFavoritesLoading', false);
          ChatWidget.UI.showLoading(false);
      }
  },

  async updateFavoritesDisplay() {
      try {
          const favorites = await ChatWidget.API.get('/api/chat/favorites/threads');
          const favoritesList = ChatWidget.UI.elements.favoritesList;
          if (!favoritesList) return;

          favoritesList.innerHTML = '';

          if (favorites.length === 0) {
              const emptyMessage = document.createElement('li');
              emptyMessage.classList.add('empty-favorites');
              emptyMessage.textContent = 'No hay conversaciones favoritas';
              favoritesList.appendChild(emptyMessage);
              return;
          }

          favorites.forEach(favorite => {
              const li = this.createFavoriteThreadElement(favorite);
              favoritesList.appendChild(li);
          });
      } catch (error) {
          ChatWidget.ErrorHandler.handle(error);
      }
  },

  createFavoriteThreadElement(favorite) {
      const li = document.createElement('li');
      li.classList.add('favorite-thread');
      li.dataset.threadId = favorite.id;

      const contentDiv = document.createElement('div');
      contentDiv.classList.add('favorite-content');

      const title = document.createElement('div');
      title.classList.add('favorite-title');
      title.textContent = favorite.favoriteNote || 
          `Conversación del ${new Date(favorite.lastUsed).toLocaleDateString()}`;

      const date = document.createElement('div');
      date.classList.add('favorite-date');
      date.textContent = new Date(favorite.lastUsed).toLocaleString();

      const favoriteButton = document.createElement('button');
      favoriteButton.classList.add('conversation-favorite-button', 'active');
      favoriteButton.innerHTML = '<span class="material-icons">star</span>';

      // Add favorite button handler
      favoriteButton.onclick = async (e) => {
          e.stopPropagation();
          try {
              const response = await ChatWidget.API.post(
                  `/api/chat/threads/${favorite.id}/favorite`,
                  ''
              );

              if (response && response.isFavorite !== undefined) {
                  this.updateThreadFavoriteStatus(favorite.id, response.isFavorite);

                  if (!response.isFavorite) {
                      li.remove();
                      ChatWidget.UI.updateStatus('success', 'Conversación eliminada de favoritos');

                      const favoritesList = ChatWidget.UI.elements.favoritesList;
                      if (!favoritesList.querySelector('.favorite-thread')) {
                          const emptyMessage = document.createElement('li');
                          emptyMessage.classList.add('empty-favorites');
                          emptyMessage.textContent = 'No hay conversaciones favoritas';
                          favoritesList.appendChild(emptyMessage);
                      }
                  }
              }
          } catch (error) {
              ChatWidget.ErrorHandler.handle(error);
          }
      };

      // Assemble the elements
      contentDiv.appendChild(title);
      contentDiv.appendChild(date);
      li.appendChild(contentDiv);
      li.appendChild(favoriteButton);
      li.onclick = () => ChatWidget.ConversationManager.loadThread(favorite.id);

      if (favorite.id === ChatWidget.State.get('currentConversationId')) {
          li.classList.add('active');
      }

      return li;
  }
};
// Error Handler Module
ChatWidget.ErrorHandler = {
  handle(error) {
    // Add console logs here if debugging
    let errorMessage = "Ha ocurrido un error. Por favor, inténtelo de nuevo.";
    let statusMessage = "Error en la operación";
    let shouldRedirect = false;

    // Check for authentication errors first
    if (this.isAuthenticationError(error)) {
      errorMessage =
        "Su sesión ha expirado. Por favor, inicie sesión nuevamente.";
      statusMessage = "Sesión expirada";
      shouldRedirect = true;
    }
    // Then check for specific HTTP status codes
    else if (error.status) {
      const response = this.getErrorResponseByStatus(error.status);
      errorMessage = response.message;
      statusMessage = response.status;
    }
    // Finally check for network errors
    else if (this.isNetworkError(error)) {
      errorMessage =
        "Error de conexión. Por favor, verifique su conexión a internet.";
      statusMessage = "Error de red";
    }

    ChatWidget.UI.updateStatus("error", statusMessage);
    ChatWidget.UI.addSystemMessage(errorMessage, "error");

    if (shouldRedirect && !ChatWidget.State.get("isRedirecting")) {
      ChatWidget.State.update("isRedirecting", true);
      this.handleRedirect();
    }
  },

  isAuthenticationError(error) {
    return (
      error.status === 401 ||
      (error.message &&
        (error.message.includes("401") ||
          error.message.toLowerCase().includes("unauthorized") ||
          error.message.toLowerCase().includes("authentication failed")))
    );
  },

  isNetworkError(error) {
    return (
      error.message &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError"))
    );
  },

  getErrorResponseByStatus(status) {
    const errorResponses = {
      403: {
        message: "No tiene permiso para realizar esta acción.",
        status: "Acceso denegado",
      },
      404: {
        message: "No se pudo encontrar el recurso solicitado.",
        status: "Recurso no encontrado",
      },
      409: {
        message: "Esta conversación está ocupada. Por favor, espere.",
        status: "Conversación ocupada",
      },
      429: {
        message: "Demasiadas solicitudes. Por favor, espere un momento.",
        status: "Límite excedido",
      },
      500: {
        message:
          "Ha ocurrido un error en el servidor. Por favor, inténtelo más tarde.",
        status: "Error del servidor",
      },
      503: {
        message:
          "El servicio no está disponible en este momento. Por favor, espere.",
        status: "Servicio no disponible",
      },
    };

    return (
      errorResponses[status] || {
        message: "Ha ocurrido un error inesperado.",
        status: "Error",
      }
    );
  },

  handleRedirect() {
    const overlay = this.createRedirectOverlay();
    this.startRedirectProcess(overlay);
  },

  createRedirectOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "redirect-overlay";
    overlay.innerHTML = `
          <div class="redirect-content">
              <div class="redirect-spinner"></div>
              <div class="redirect-message">Su sesión ha expirado</div>
              <div class="redirect-countdown"></div>
          </div>
      `;
    document.body.appendChild(overlay);

    // Show overlay with animation
    requestAnimationFrame(() => {
      overlay.classList.add("active");
    });

    return overlay;
  },

  startRedirectProcess(overlay) {
    // Disable all interactive elements
    this.disableInteractions();

    // Update countdown
    const countdownEl = overlay.querySelector(".redirect-countdown");
    let secondsLeft = 2;
    countdownEl.textContent = `Redirigiendo en ${secondsLeft} segundos...`;

    const countdownInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft > 0) {
        countdownEl.textContent = `Redirigiendo en ${secondsLeft} segundo${
          secondsLeft !== 1 ? "s" : ""
        }...`;
      }
    }, 1000);

    // Handle redirect
    setTimeout(() => {
      clearInterval(countdownInterval);
      try {
        window.location.href = loginPageRoute;
      } catch (e) {
        ChatWidget.State.update("isRedirecting", false);
        this.enableInteractions();
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
        ChatWidget.UI.addSystemMessage(
          "Error al redirigir. Por favor, recargue la página.",
          "error"
        );
      }
    }, 2000);
  },

  disableInteractions() {
    const interactiveElements = document.querySelectorAll(
      "#chat-input, " +
        "#chat-form button, " +
        ".favorite-button, " +
        ".conversation-favorite-button, " +
        ".past-conversations button, " +
        "#past-conversations-btn, " +
        "#close-past-conversations-btn"
    );

    interactiveElements.forEach((element) => {
      if (element) {
        element.disabled = true;
        element.classList.add("disabled");
      }
    });

    const form = document.querySelector("#chat-form");
    if (form) {
      form.onsubmit = (e) => e.preventDefault();
    }
  },

  enableInteractions() {
    const interactiveElements = document.querySelectorAll(
      "#chat-input, " +
        "#chat-form button, " +
        ".favorite-button, " +
        ".conversation-favorite-button, " +
        ".past-conversations button, " +
        "#past-conversations-btn, " +
        "#close-past-conversations-btn"
    );

    interactiveElements.forEach((element) => {
      if (element) {
        element.disabled = false;
        element.classList.remove("disabled");
      }
    });

    const form = document.querySelector("#chat-form");
    if (form) {
      form.onsubmit = null;
    }
  },
};
// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  ChatWidget.initialize().catch((error) => {
    ChatWidget.ErrorHandler.handle(error);
  });
});
