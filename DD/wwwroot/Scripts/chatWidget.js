document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const elements = {
    widget: document.getElementById("chat-widget"),
    form: document.getElementById("chat-form"),
    input: document.getElementById("chat-input"),
    messages: document.getElementById("chat-messages"),
    loading: document.getElementById("chat-loading"),
    submitButton: document.querySelector('#chat-form button[type="submit"]'),
    pastConversationsBtn: document.getElementById("past-conversations-btn"),
    pastConversations: document.getElementById("past-conversations"),
    conversationList: document.getElementById("conversation-list"),
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
  };

  // State
  const state = {
    currentConversationId: null,
    isWaitingForResponse: false,
    isProcessing: false,
    isReadOnly: false,
    currentView: "messages",
    recentConversations: [],
    token: JSON.parse(localStorage.getItem("authToken") || "{}").token || "",
    isFavoritesLoading: false,
  };

  // Constants
  const constants = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    apiBaseUrl: assistantApiBaseUrl,
  };

  // Core UI Functions
  function updateStatus(type, message) {
    elements.status.container.className = "chat-status";
    elements.status.icon.textContent = "";

    const iconMap = {
      processing: "sync",
      error: "error_outline",
      success: "check_circle",
      busy: "hourglass_empty",
    };

    elements.status.icon.textContent = iconMap[type] || "";
    elements.status.container.classList.add(
      type === "busy" ? "processing" : type
    );
    elements.status.text.textContent = message;
    elements.status.container.classList.remove("hidden");

    if (type === "success") {
      setTimeout(() => elements.status.container.classList.add("hidden"), 3000);
    }
  }

  function updateUIState() {
    const isDisabled =
      state.isWaitingForResponse ||
      state.isReadOnly ||
      state.isProcessing ||
      state.currentView === "favorites";

    elements.input.disabled = isDisabled;
    elements.submitButton.disabled = isDisabled;

    // Update placeholder text based on state
    if (state.currentView === "favorites") {
      elements.input.placeholder =
        "No se pueden enviar mensajes en la vista de favoritos";
    } else if (state.isProcessing) {
      elements.input.placeholder = "Procesando mensaje anterior...";
    } else if (state.isWaitingForResponse) {
      elements.input.placeholder = "Esperando respuesta...";
    } else if (state.isReadOnly) {
      elements.input.placeholder = "Modo solo lectura";
    } else {
      elements.input.placeholder = "Escribe tu mensaje aquí...";
    }
  }

  function setProcessing(processing) {
    state.isProcessing = processing;
    elements.input.disabled = processing;
    elements.submitButton.disabled = processing;

    if (processing) {
      elements.input.placeholder = "Procesando mensaje...";
      elements.indicators.error.classList.add("visible");
    } else {
      elements.indicators.error.classList.remove("visible");
      // Only reset placeholder if we're not in another state
      if (!state.isWaitingForResponse && !state.isReadOnly) {
        elements.input.placeholder = "Escribe tu mensaje aquí...";
      }
    }
    updateUIState();
  }

  function setWaitingForResponse(waiting) {
    state.isWaitingForResponse = waiting;
    elements.input.disabled = waiting;
    elements.submitButton.disabled = waiting;

    if (waiting) {
      showTypingIndicator();
      elements.input.placeholder = "Esperando respuesta...";
    } else {
      hideTypingIndicator();
      elements.input.placeholder = "Escribe tu mensaje aquí...";
    }
  }

  function setReadOnly(readonly) {
    state.isReadOnly = readonly;
    updateUIState();
  }

  function showLoading(show) {
    elements.loading.style.display = show ? "flex" : "none";
    elements.messages.style.display = show ? "none" : "block";
  }

  function showTypingIndicator() {
    // Remove any existing typing indicators first
    hideTypingIndicator();

    const indicator = document.createElement("div");
    indicator.classList.add("typing-indicator");
    indicator.innerHTML = `
        <div>
            <span class="message-sender">DDEyC</span>
        </div>
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    elements.messages.appendChild(indicator);
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function hideTypingIndicator() {
    const existingIndicators =
      elements.messages.querySelectorAll(".typing-indicator");
    existingIndicators.forEach((indicator) => indicator.remove());
  }

  function addSystemMessage(content, type = "error") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "system-message", type);
    messageElement.textContent = content;
    elements.messages.appendChild(messageElement);
    elements.messages.scrollTop = elements.messages.scrollHeight;
    return messageElement;
  }

  // Replace the promptForNote function with this new version
  function promptForNote() {
    return new Promise((resolve) => {
      const modal = document.getElementById("note-modal");
      const noteInput = document.getElementById("note-input");
      const confirmButton = modal.querySelector(".confirm");
      const cancelButton = modal.querySelector(".cancel");

      // Show modal
      modal.classList.remove("hidden");
      noteInput.value = ""; // Clear previous input
      noteInput.focus();

      // Handle confirmation
      const handleConfirm = () => {
        const note = noteInput.value.trim();
        modal.classList.add("hidden");
        cleanup();
        resolve(note);
      };

      // Handle cancel
      const handleCancel = () => {
        modal.classList.add("hidden");
        cleanup();
        resolve("");
      };

      // Handle Enter key
      const handleKeydown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleConfirm();
        } else if (e.key === "Escape") {
          handleCancel();
        }
      };

      // Clean up event listeners
      const cleanup = () => {
        confirmButton.removeEventListener("click", handleConfirm);
        cancelButton.removeEventListener("click", handleCancel);
        noteInput.removeEventListener("keydown", handleKeydown);
      };

      // Add event listeners
      confirmButton.addEventListener("click", handleConfirm);
      cancelButton.addEventListener("click", handleCancel);
      noteInput.addEventListener("keydown", handleKeydown);
    });
  }
  // API Functions
  const api = {
    async request(endpoint, options = {}) {
      const response = await fetch(`${constants.apiBaseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: state.token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = new Error();
        error.status = response.status;
        try {
          const errorData = await response.json();
          error.message =
            errorData.message || errorData.error || response.statusText;
        } catch {
          error.message = response.statusText;
        }
        throw error;
      }

      return response.json();
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
  };

  // Message Handling Functions
  function createMessage(content, role, message = {}) {
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
            }" title="Marcar como favorito">
                <span class="material-icons">${
                  message.isFavorite ? "star" : "star_border"
                }</span>
            </button>
        </div>
        ${
          message.isFavorite && message.favoriteNote
            ? `
            <div class="favorite-note">Nota: ${message.favoriteNote}</div>
        `
            : ""
        }
    `;

    messageElement.innerHTML = messageContent;

    // Add click handler to the favorite button
    const favoriteButton = messageElement.querySelector(".favorite-button");

    if (favoriteButton && message.id) {
      // For message favorites:
      // Message favorite handler
      favoriteButton.addEventListener("click", async (e) => {
        e.stopPropagation();
        try {
          const isFavorited = favoriteButton.classList.contains("active");
          let note = "";

          if (!isFavorited) {
            note = await promptForNote();
            if (note === null) return;
          }

          const response = await api.post(
            `/api/chat/messages/${message.id}/favorite`,
            note
          );
          if (response && response.isFavorite !== undefined) {
            updateMessageFavoriteUI(
              favoriteButton,
              messageElement,
              response,
              note
            );
            updateStatus(
              "success",
              `Mensaje ${
                response.isFavorite ? "agregado a" : "eliminado de"
              } favoritos`
            );

            if (state.currentView === "favorites" && !response.isFavorite) {
              messageElement.remove();
              if (!elements.messages.querySelector(".message")) {
                addSystemMessage("No hay mensajes favoritos", "info");
              }
            }
          } else {
            throw new Error("Invalid response from server");
          }
        } catch (error) {
          handleError(error);
        }
      });
    }

    elements.messages.appendChild(messageElement);
    elements.messages.scrollTop = elements.messages.scrollHeight;
    return messageElement;
  }
  function updateMessageFavoriteUI(button, messageElement, result, note) {
    // Update star icon
    button.innerHTML = `<span class="material-icons">${
      result.isFavorite ? "star" : "star_border"
    }</span>`;
    button.classList.toggle("active", result.isFavorite);

    // Update or remove note
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
  }
  // Chat Core Functions
  async function startChat() {
    showLoading(true);
    try {
      const data = await api.post(assistantStartChatEndpoint);
      state.currentConversationId = data.id;
      elements.messages.innerHTML = "";

      addMessageToolbar();

      data.messages.forEach((message) =>
        createMessage(message.content, message.role.toLowerCase(), {
          id: message.id,
          isFavorite: message.isFavorite,
          favoriteNote: message.favoriteNote,
        })
      );

      await fetchRecentConversations();
      updateStatus("success", "Conversación iniciada");
    } catch (error) {
      handleError(error);
    } finally {
      showLoading(false);
    }
  }

  async function sendMessage() {
    const message = elements.input.value.trim();
    if (
      !message ||
      state.isWaitingForResponse ||
      state.isReadOnly ||
      state.isProcessing
    ) {
      return;
    }

    try {
      setProcessing(true);
      elements.input.value = "";
      const messageElement = createMessage(message, "user", {});

      // Set waiting state before making the API call

      const currentConversation = state.recentConversations.find(
        (c) => c.id === state.currentConversationId
      );

      if (!currentConversation) {
        throw new Error("Current conversation not found");
      }
      setProcessing(false);
      setWaitingForResponse(true);

      const data = await api.post(assistantChatEndpoint, {
        threadId: currentConversation.threadId,
        userMessage: message,
      });

      createMessage(data.response, "assistant", {
        id: data.messageId,
        isFavorite: false,
      });

      await updateConversationDisplay();
      updateStatus("success", "Mensaje enviado correctamente");
    } catch (error) {
      handleError(error);
      const lastMessage = elements.messages.querySelector(
        ".user-message:last-child"
      );
      if (lastMessage) lastMessage.remove();
    } finally {
      setWaitingForResponse(false);
    }
  }

  async function loadThread(threadId) {
    if (
      threadId === state.currentConversationId &&
      state.currentView === "messages"
    )
      return;

    showLoading(true);
    try {
      const messages = await api.get(
        `${assistantGetMessageEndpointStart}${threadId}${assistantGetMessageEndpointContinue}`
      );

      state.currentConversationId = threadId;
      state.currentView = "messages";
      elements.messages.innerHTML = "";

      messages.forEach((message) => {
        createMessage(message.content, message.role.toLowerCase(), {
          id: message.id,
          isFavorite: message.isFavorite,
          favoriteNote: message.favoriteNote,
        });
      });

      updateConversationDisplay();
      updateUIState(); // Update UI state after loading thread
      updateStatus("success", "Conversación cargada");

      const toolbar = document.querySelector(".messages-toolbar");
      if (toolbar) {
        const allButton = toolbar.children[0];
        const favButton = toolbar.children[1];
        updateToolbarState(allButton, favButton);
      }
    } catch (error) {
      handleError(error);
    } finally {
      showLoading(false);
    }
  }
  async function fetchRecentConversations() {
    try {
      state.recentConversations = await api.get(assistantRecentThreadsEndpoint);
      updateConversationDisplay();
    } catch (error) {
      handleError(error);
      return [];
    }
  }
  // Favorites and Display Functions
  async function toggleThreadFavorite(threadId) {
    try {
      const note = await promptForNote();
      const result = await api.post(
        `/api/chat/threads/${threadId}/favorite`,
        note
      );

      updateStatus(
        "success",
        `Conversación ${
          result.isFavorite ? "agregada a" : "eliminada de"
        } favoritos`
      );

      await updateConversationDisplay();
      return result.isFavorite;
    } catch (error) {
      handleError(error);
      return false;
    }
  }
  function updateThreadFavoriteStatus(threadId, isFavorite, note = "") {
    // Update in regular conversation list
    const regularListItem = elements.conversationList.querySelector(
      `li[data-thread-id="${threadId}"]`
    );
    if (regularListItem) {
      const favButton = regularListItem.querySelector(
        ".conversation-favorite-button"
      );
      if (favButton) {
        favButton.innerHTML = `<span class="material-icons">${
          isFavorite ? "star" : "star_border"
        }</span>`;
        favButton.classList.toggle("active", isFavorite);
      }
    }

    // Find corresponding conversation in state and update it
    const conversation = state.recentConversations.find(
      (c) => c.id === threadId
    );
    if (conversation) {
      conversation.isFavorite = isFavorite;
      conversation.favoriteNote = isFavorite ? note : null;
    }
  }
  async function updateFavoritesDisplay() {
    const favorites = await api.get("/api/chat/favorites/threads");
    const favoritesList = document.getElementById("favorites-list");
    if (!favoritesList) return;

    favoritesList.innerHTML = "";

    favorites.forEach((favorite) => {
      const li = document.createElement("li");
      li.classList.add("favorite-thread");
      li.dataset.threadId = favorite.id; // Add thread ID for reference

      const contentDiv = document.createElement("div");
      contentDiv.classList.add("favorite-content");

      const title = document.createElement("div");
      title.classList.add("favorite-title");
      title.textContent =
        favorite.favoriteNote ||
        `Conversación del ${new Date(favorite.lastUsed).toLocaleDateString()}`;

      const date = document.createElement("div");
      date.classList.add("favorite-date");
      date.textContent = new Date(favorite.lastUsed).toLocaleString();

      // Create favorite button
      const favoriteButton = document.createElement("button");
      favoriteButton.classList.add("conversation-favorite-button", "active");
      favoriteButton.innerHTML = '<span class="material-icons">star</span>';

      // Add click handler for the favorite button
      favoriteButton.onclick = async (e) => {
        e.stopPropagation();
        try {
          const response = await api.post(
            `/api/chat/threads/${favorite.id}/favorite`,
            ""
          );
          if (response && response.isFavorite !== undefined) {
            // Update both lists
            updateThreadFavoriteStatus(favorite.id, response.isFavorite);

            if (!response.isFavorite) {
              // Remove from favorites list
              li.remove();
              updateStatus("success", "Conversación eliminada de favoritos");

              // Check if favorites list is empty and add message if needed
              if (!favoritesList.querySelector(".favorite-thread")) {
                const emptyMessage = document.createElement("li");
                emptyMessage.classList.add("empty-favorites");
                emptyMessage.textContent = "No hay conversaciones favoritas";
                favoritesList.appendChild(emptyMessage);
              }
            }
          }
        } catch (error) {
          handleError(error);
        }
      };

      // Assemble the elements
      contentDiv.appendChild(title);
      contentDiv.appendChild(date);
      li.appendChild(contentDiv);
      li.appendChild(favoriteButton);
      li.onclick = () => loadThread(favorite.id);

      if (favorite.id === state.currentConversationId) {
        li.classList.add("active");
      }

      favoritesList.appendChild(li);
    });

    // Add empty message if no favorites exist
    if (favorites.length === 0) {
      const emptyMessage = document.createElement("li");
      emptyMessage.classList.add("empty-favorites");
      emptyMessage.textContent = "No hay conversaciones favoritas";
      favoritesList.appendChild(emptyMessage);
    }
  }

  function updateConversationDisplay() {
    elements.conversationList.innerHTML = "";

    state.recentConversations.forEach((conversation) => {
      const li = document.createElement("li");
      li.dataset.threadId = conversation.id; // Add thread ID for reference
      li.textContent = `Conversación ${new Date(
        conversation.lastUsed
      ).toLocaleString()}`;
      li.onclick = () => loadThread(conversation.id);

      const favoriteButton = document.createElement("button");
      favoriteButton.classList.add("conversation-favorite-button");
      favoriteButton.innerHTML = `<span class="material-icons">${
        conversation.isFavorite ? "star" : "star_border"
      }</span>`;
      if (conversation.isFavorite) favoriteButton.classList.add("active");

      favoriteButton.onclick = async (e) => {
        e.stopPropagation();
        try {
          const note = conversation.isFavorite ? "" : await promptForNote();
          if (!conversation.isFavorite && note === null) return;

          const response = await api.post(
            `/api/chat/threads/${conversation.id}/favorite`,
            note
          );
          if (response && response.isFavorite !== undefined) {
            // Update both lists
            updateThreadFavoriteStatus(
              conversation.id,
              response.isFavorite,
              note
            );
            await updateFavoritesDisplay();

            updateStatus(
              "success",
              `Conversación ${
                response.isFavorite ? "agregada a" : "eliminada de"
              } favoritos`
            );
          }
        } catch (error) {
          handleError(error);
        }
      };

      if (conversation.id === state.currentConversationId) {
        li.classList.add("active");
      }

      li.appendChild(favoriteButton);
      elements.conversationList.appendChild(li);
    });

    const isCurrentConversationMostRecent =
      state.currentConversationId === state.recentConversations[0]?.id;
    setReadOnly(!isCurrentConversationMostRecent);

    updateFavoritesDisplay();
  }

  function addMessageToolbar() {
    const existingToolbar = document.querySelector(".messages-toolbar");
    if (existingToolbar) {
      existingToolbar.remove();
    }

    const toolbar = document.createElement("div");
    toolbar.classList.add("messages-toolbar");

    const viewAllButton = document.createElement("button");
    viewAllButton.textContent = "Hilo actual";
    viewAllButton.onclick = () => {
      if (
        state.currentView !== "messages" ||
        !elements.messages.querySelector(".message")
      ) {
        loadThread(state.currentConversationId);
      }
      state.currentView = "messages";
      updateToolbarState(viewAllButton, viewFavoritesButton);
    };

    const viewFavoritesButton = document.createElement("button");
    viewFavoritesButton.textContent = "Mensajes favoritos";
    viewFavoritesButton.onclick = () => {
      showFavoriteMessages();
      state.currentView = "favorites";
      updateToolbarState(viewAllButton, viewFavoritesButton);
    };

    toolbar.appendChild(viewAllButton);
    toolbar.appendChild(viewFavoritesButton);

    elements.messages.parentNode.insertBefore(toolbar, elements.messages);
    updateToolbarState(viewAllButton, viewFavoritesButton);
  }
  function updateToolbarState(allButton, favoritesButton) {
    allButton.classList.toggle("active", state.currentView === "messages");
    favoritesButton.classList.toggle(
      "active",
      state.currentView === "favorites"
    );
  }
  // TODO: make URL configurable
  async function showFavoriteMessages() {
    try {
      state.isFavoritesLoading = true;
      showLoading(true);

      const favorites = await api.get("/api/chat/favorites/messages");
      elements.messages.innerHTML = "";

      if (favorites.length === 0) {
        addSystemMessage("No hay mensajes favoritos", "info");
        return;
      }

      favorites.forEach((message) => {
        createMessage(message.content, message.role.toLowerCase(), {
          id: message.id,
          isFavorite: true, // Always true in favorites view
          favoriteNote: message.favoriteNote,
        });
      });

      state.currentView = "favorites";
      updateUIState(); // Update UI state after switching view
    } catch (error) {
      handleError(error);
    } finally {
      state.isFavoritesLoading = false;
      showLoading(false);
    }
  }

  async function refreshCurrentView() {
    if (state.currentView === "favorites") {
      await showFavoriteMessages();
    } else if (state.currentConversationId) {
      await loadThread(state.currentConversationId);
    }
  }
  // Error Handling Function
  function handleError(error) {
    console.error("Error:", error);
    let errorMessage = "Ha ocurrido un error. Por favor, inténtelo de nuevo.";
    let statusMessage = "Error en la operación";

    if (error.status) {
      const errorMessages = {
        401: {
          message:
            "Su sesión ha expirado. Por favor, inicie sesión nuevamente.",
          status: "Sesión expirada",
        },
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

      if (errorMessages[error.status]) {
        errorMessage = errorMessages[error.status].message;
        statusMessage = errorMessages[error.status].status;
      }
    } else if (error.message) {
      if (error.message.toLowerCase().includes("unauthorized")) {
        errorMessage =
          "Su sesión ha expirado. Por favor, inicie sesión nuevamente.";
        statusMessage = "Sesión expirada";
      } else if (
        error.message.includes("CONVERSATION_BUSY") ||
        error.message.includes("PROCESSING_IN_PROGRESS")
      ) {
        errorMessage = "Esta conversación está ocupada. Por favor, espere.";
        statusMessage = "Conversación ocupada";
      } else if (error.message.includes("INVALID_THREAD")) {
        errorMessage = "La conversación no es válida o ha expirado.";
        statusMessage = "Conversación inválida";
      } else if (
        error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError")
      ) {
        errorMessage =
          "Error de conexión. Por favor, verifique su conexión a internet.";
        statusMessage = "Error de red";
      }
    }

    updateStatus("error", statusMessage);
    addSystemMessage(errorMessage, "error");

    if (
      error.status === 401 ||
      error.message?.toLowerCase().includes("unauthorized")
    ) {
      setTimeout(() => {
        window.location.href = loginPageRoute;
      }, 2000);
    }
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Close modal event
    const closeNoteModalButton = document.getElementById(
      "button-close-note-modal"
    );
    const noteModal = document.getElementById("note-modal");

    if (closeNoteModalButton && noteModal) {
      closeNoteModalButton.addEventListener("click", () => {
        noteModal.classList.add("hidden");
      });
    }
    elements.pastConversationsBtn.addEventListener("click", () => {
      elements.pastConversations.classList.toggle("hidden");
      elements.widget.querySelector(".chat-main").classList.toggle("shifted");
    });

    elements.closePastConversationsBtn.addEventListener("click", () => {
      elements.pastConversations.classList.toggle("hidden");
      elements.widget.querySelector(".chat-main").classList.toggle("shifted");
    });

    elements.form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (
        !state.isWaitingForResponse &&
        !state.isReadOnly &&
        !state.isProcessing
      ) {
        sendMessage();
      }
    });

    elements.input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (
          !state.isWaitingForResponse &&
          !state.isReadOnly &&
          !state.isProcessing
        ) {
          sendMessage();
        }
      }
    });

    elements.input.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });

    window.addEventListener("online", () => {
      updateStatus("success", "Conexión restaurada");
      if (state.currentConversationId) {
        fetchRecentConversations();
      }
    });

    window.addEventListener("offline", () => {
      updateStatus("error", "Sin conexión");
      addSystemMessage("Se ha perdido la conexión a Internet. Reconectando...");
    });

    window.addEventListener("beforeunload", (e) => {
      if (state.isProcessing || state.isWaitingForResponse) {
        e.returnValue = "Hay un mensaje en proceso. ¿Seguro que desea salir?";
        return e.returnValue;
      }
    });

    if ("visualViewport" in window) {
      window.visualViewport.addEventListener("resize", () => {
        elements.messages.scrollTop = elements.messages.scrollHeight;
      });
    }
  }

  // Initialize Function
  function initialize() {
    // Initialize markdown
    marked.setOptions({
      gfm: true,
      breaks: true,
      sanitize: false,
      smartLists: true,
      smartypants: true,
    });

    // Initialize DOMPurify
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

    setupEventListeners();
    startChat();
  }

  // Start the application
  initialize();
});
