document.addEventListener("DOMContentLoaded", function() {
    const popup = document.getElementById("linkedin-auth-popup");
    const closeButton = document.getElementById("close-linkedin-popup");
    const cancelButton = document.getElementById("cancel-linkedin-auth");
    const confirmButton = document.getElementById("confirm-linkedin-auth");
    const dontShowCheckbox = document.getElementById("dont-show-again");
    const hiddenAuthTrigger = document.getElementById("linkedin-auth-trigger");

    function showLinkedInLoginPrompt() {
        if (!localStorage.getItem('hideLinkedInPrompt')) {
            popup.classList.remove('hidden');
        }
    }

    function hideLinkedInLoginPrompt() {
        popup.classList.add('hidden');
        if (dontShowCheckbox.checked) {
            localStorage.setItem('hideLinkedInPrompt', 'true');
        }
    }

    function redirectToLinkedInLogin() {
        const authUrl = new URL(linkedInAuthUrl);
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', linkedInClientId);
        authUrl.searchParams.append('redirect_uri', linkedInRedirectUri);
        authUrl.searchParams.append('scope', linkedInScope);
        
        window.location.href = authUrl.toString();
    }

    function toggleLinkedInPrompt() {
        if (popup.classList.contains('hidden')) {
            localStorage.removeItem('hideLinkedInPrompt');
            dontShowCheckbox.checked = false;
            popup.classList.remove('hidden');
        } else {
            popup.classList.add('hidden');
        }
    }

    // Event listeners
    closeButton?.addEventListener('click', hideLinkedInLoginPrompt);
    cancelButton?.addEventListener('click', hideLinkedInLoginPrompt);
    confirmButton?.addEventListener('click', function() {
        hideLinkedInLoginPrompt();
        redirectToLinkedInLogin();
    });
    
    // Hidden trigger now toggles the popup instead of direct redirect
    hiddenAuthTrigger?.addEventListener('click', toggleLinkedInPrompt);

    // Only close on outside click, no redirect
    popup?.addEventListener('click', function(event) {
        if (event.target === popup) {
            hideLinkedInLoginPrompt();
        }
    });

    // Show the prompt by default unless user chose not to see it
    showLinkedInLoginPrompt();
});