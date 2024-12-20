const authHandler = {
    init() {
        this.baseUrl = window.AppSettings?.AuthApiUrl;
        console.log(this.baseUrl);
        this.isProd = window.AppSettings?.IsProd ?? false;
        this.loginPageRoute = window.AppSettings?.LoginPageRoute;
        
        if (this.isProd) {
            document.cookie = "prefer-cookies=true; path=/; secure; samesite=strict";
        }
    },

    async fetch(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add JWT in non-prod environments
        if (!this.isProd) {
            const auth = JSON.parse(localStorage.getItem('authToken') || '{}');
            if (auth.token) {
                headers['Authorization'] = `Bearer ${auth.token}`;
            }
        }

        const url = endpoint.startsWith(this.baseUrl) ? endpoint : `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include' // Always include cookies
        });

        if (!response.ok) {
            const error = new Error('Authentication failed');
            error.status = response.status;
            throw error;
        }

        return response.json();
    },

    async login(email, password) {
        try {
            // Build query string for the URL
            const queryString = `?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
            const response = await this.fetch(`/api/auth/login${queryString}`, {
                method: 'POST'
            });

            // For prod (cookies), we just need the success response
            if (this.isProd) {
                return { authenticated: response.authenticated };
            }

            // For non-prod (JWT), store the token
            if (response.userToken) {
                localStorage.setItem('authToken', JSON.stringify({
                    token: response.userToken,
                    expirationDate: response.expirationDate
                }));
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    async logout() {
        try {
            await this.fetch('/api/auth/logout', {
                method: 'POST'
            });

            if (!this.isProd) {
                localStorage.removeItem('authToken');
            }
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    async checkAuth() {
        try {
            const response = await this.fetch('/api/auth/validateSession');
            return response.Session != null;
        } catch {
            return false;
        }
    }
};

// Initialize the handler
authHandler.init();
window.authHandler = authHandler;