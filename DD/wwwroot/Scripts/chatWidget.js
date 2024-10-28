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
      state.isWaitingForResponse || state.isReadOnly || state.isProcessing;
    elements.input.disabled = isDisabled;
    elements.submitButton.disabled = isDisabled;

    if (elements.indicators.typing) {
      elements.indicators.typing.classList.toggle(
        "hidden",
        !state.isWaitingForResponse
      );
    }
    elements.indicators.error.classList.toggle("hidden", !state.isProcessing);

    elements.input.placeholder = state.isProcessing
      ? "Procesando mensaje anterior..."
      : state.isWaitingForResponse
      ? "Esperando respuesta..."
      : state.isReadOnly
      ? "Modo solo lectura"
      : "Escribe tu mensaje aquí...";
  }

  function setProcessing(processing) {
    state.isProcessing = processing;
    elements.input.disabled = processing;
    elements.submitButton.disabled = processing;
    elements.indicators.error.classList.toggle("visible", processing);
  }

  function setWaitingForResponse(waiting) {
    state.isWaitingForResponse = waiting;
    elements.input.disabled = waiting;
    elements.submitButton.disabled = waiting;

    if (waiting) {
      showTypingIndicator();
    } else {
      hideTypingIndicator();
    }
    elements.indicators.error.classList.remove("visible");
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
    if (elements.messages.querySelector(".typing-indicator")) return;

    const indicator = document.createElement("div");
    indicator.classList.add("typing-indicator");
    indicator.innerHTML = `
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
    elements.messages
      .querySelectorAll(".typing-indicator")
      .forEach((indicator) => indicator.remove());
  }

  function addSystemMessage(content, type = "error") {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "system-message", type);
    messageElement.textContent = content;
    elements.messages.appendChild(messageElement);
    elements.messages.scrollTop = elements.messages.scrollHeight;
    return messageElement;
  }

  function promptForNote() {
    return new Promise((resolve) => {
      const note = prompt("Agregar una nota (opcional):", "");
      resolve(note || "");
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

    const senderElement = document.createElement("div");
    senderElement.classList.add("message-sender");
    senderElement.textContent = role === "user" ? "Usuario" : "DDEyC";

    const contentElement = document.createElement("div");
    contentElement.classList.add("message-content");

    const actionsElement = document.createElement("div");
    actionsElement.classList.add("message-actions");

    // Create favorite button
    const favoriteButton = document.createElement("button");
    favoriteButton.classList.add("favorite-button");
    favoriteButton.innerHTML = `<span class="material-icons">${
      message.isFavorite ? "star" : "star_border"
    }</span>`;
    favoriteButton.classList.toggle("active", message.isFavorite);

    // Add favorite button handler
    favoriteButton.onclick = async (e) => {
      e.stopPropagation();
      if (!messageElement.dataset.messageId) return;

      try {
        const note = await promptForNote();
        const result = await api.post(
          `/api/chat/messages/${messageElement.dataset.messageId}/favorite`,
          note
        );

        updateMessageFavoriteUI(favoriteButton, messageElement, result, note);
        updateStatus(
          "success",
          `Mensaje ${
            result.isFavorite ? "agregado a" : "eliminado de"
          } favoritos`
        );
      } catch (error) {
        handleError(error);
      }
    };

    // Add content
    if (role === "assistant") {
      contentElement.innerHTML = DOMPurify.sanitize(marked.parse(content));
    } else {
      contentElement.textContent = content;
    }

    // Add existing note if present
    if (message.isFavorite && message.favoriteNote) {
      const noteElement = document.createElement("div");
      noteElement.classList.add("favorite-note");
      noteElement.textContent = `Nota: ${message.favoriteNote}`;
      messageElement.appendChild(noteElement);
    }

    // Assemble message
    actionsElement.appendChild(favoriteButton);
    messageElement.appendChild(senderElement);
    messageElement.appendChild(contentElement);
    messageElement.appendChild(actionsElement);

    elements.messages.appendChild(messageElement);
    elements.messages.scrollTop = elements.messages.scrollHeight;
    return messageElement;
  }

  function updateMessageFavoriteUI(button, messageElement, result, note) {
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
      const currentConversation = state.recentConversations.find(
        (c) => c.id === state.currentConversationId
      );

      if (!currentConversation) {
        throw new Error("Current conversation not found");
      }

      elements.input.value = "";
      const messageElement = createMessage(message, "user", {});

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
      setProcessing(false);
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
      updateStatus("success", "Conversación cargada");

      // Update toolbar state after loading
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

  async function updateFavoritesDisplay() {
    const favorites = await api.get("/api/chat/favorites/threads");
    const favoritesList = document.getElementById("favorites-list");
    if (!favoritesList) return;

    favoritesList.innerHTML = "";

    favorites.forEach((favorite) => {
      const li = document.createElement("li");
      li.classList.add("favorite-thread");

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

      contentDiv.appendChild(title);
      contentDiv.appendChild(date);
      li.appendChild(contentDiv);
      li.onclick = () => loadThread(favorite.id);

      if (favorite.id === state.currentConversationId) {
        li.classList.add("active");
      }

      favoritesList.appendChild(li);
    });
  }

  function updateConversationDisplay() {
    elements.conversationList.innerHTML = "";

    state.recentConversations.forEach((conversation) => {
      const li = document.createElement("li");
      li.textContent = `Conversación ${new Date(
        conversation.lastUsed
      ).toLocaleString()}`;
      li.onclick = () => loadThread(conversation.id);

      const favoriteButton = document.createElement("button");
      favoriteButton.classList.add("conversation-favorite-button");
      favoriteButton.innerHTML = `<span class="material-icons">${
        conversation.isFavorite ? "star" : "star_border"
      }</span>`;

      favoriteButton.onclick = async (e) => {
        e.stopPropagation();
        const isFavorite = await toggleThreadFavorite(conversation.id);
        favoriteButton.innerHTML = `<span class="material-icons">${
          isFavorite ? "star" : "star_border"
        }</span>`;
        favoriteButton.classList.toggle("active", isFavorite);
        await updateFavoritesDisplay();
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
      const favorites = await api.get("/api/chat/favorites/messages");
      elements.messages.innerHTML = "";

      if (favorites.length === 0) {
        addSystemMessage("No hay mensajes favoritos", "info");
        return;
      }

      favorites.forEach((message) => {
        createMessage(message.content, message.role.toLowerCase(), {
          id: message.id,
          isFavorite: true,
          favoriteNote: message.favoriteNote,
        });
      });

      state.currentView = "favorites";
    } catch (error) {
      handleError(error);
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
