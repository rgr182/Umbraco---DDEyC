class RedirectButtonHandler {
    constructor(config) {
        this.config = config;
        this.button = document.getElementById('homeRedirectButton');
        if (!this.button) return;

        this.buttonTextElement = this.button.querySelector('.button-text');
        this.spinnerElement = this.button.querySelector('.loading-spinner');
        this.defaultButtonText = this.buttonTextElement.textContent;

        this.initialize();
    }

    initialize() {
        this.button.addEventListener('click', () => this.handleClick());
    }

    setLoadingState(isLoading) {
        this.button.disabled = isLoading;
        this.spinnerElement.style.display = isLoading ? 'inline-block' : 'none';
        this.buttonTextElement.textContent = isLoading ? 'Verificando...' : this.defaultButtonText;
    }

    showNotification(message, type = 'danger') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
        notification.style.zIndex = '1050';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            notification.addEventListener('animationend', () => notification.remove());
        }, 3000);
    }

    handleUnauthorized() {
        window.location.href = this.config.loginUrl;
    }

    async validateSession(token = null) {
        

        const requestOptions = {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        };

        if (token) {
           
            requestOptions.headers['Authorization'] = `Bearer ${token}`;
        }

        

        const response = await fetch(this.config.validateEndpoint, requestOptions);
        

        if (response.status === 401 || response.status === 403) {
            this.handleUnauthorized();
            return null;
        }

        if (!response.ok) {
            const error = new Error('Session validation failed');
            error.status = response.status;
            throw error;
        }

        const data = await response.json();
        
        return data;
    }

    async handleClick() {
        
        try {
            this.setLoadingState(true);
            let isValid = false;
            let validationResult = null;

            try {
                if (this.config.preferCookies) {
                    
                    validationResult = await this.validateSession();
                    
                    isValid = validationResult && validationResult.session && validationResult.session.userId;
                } else {
                    
                    const authData = localStorage.getItem('authToken');
                    

                    if (authData) {
                        const { token } = JSON.parse(authData);
                        validationResult = await this.validateSession(token);
                        
                        isValid = validationResult && validationResult.session && validationResult.session.userId;
                    }
                }

                console.log('🔐 Session validity:', {
                    isValid,
                    validationResult,
                    authMethod: this.config.preferCookies ? 'Cookie' : 'Token'
                });

            } catch (error) {
                console.error('❌ Validation error:', error);
                this.setLoadingState(false);

                if (error.status === 401 || error.status === 403) {
                    this.handleUnauthorized();
                    return;
                }
                this.showNotification('Error al verificar la sesión. Por favor, intente nuevamente.');
                return;
            }

            if (isValid) {
                window.location.href = this.config.redirectUrl;
            } else {
                window.location.href = this.config.loginUrl;
            }

        } catch (error) {
            console.error('💥 Operation failed:', error);
            this.setLoadingState(false);
            this.showNotification('Error al verificar la sesión. Por favor, intente nuevamente.');
        } finally {
            this.setLoadingState(false);
        }
    }
}

// Export for use in other modules
window.RedirectButtonHandler = RedirectButtonHandler;