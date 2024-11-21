document.addEventListener("DOMContentLoaded", function() {
    const popup = document.getElementById("linkedin-auth-popup");
    const closeButton = document.getElementById("close-linkedin-popup");
    const cancelButton = document.getElementById("cancel-linkedin-auth");
    const confirmButton = document.getElementById("confirm-linkedin-auth");

    function showLinkedInPopup() {
        if (!localStorage.getItem('linkedInAuthenticated')) {
            popup.classList.remove('hidden');
        }
    }

    function hideLinkedInPopup() {
        popup.classList.add('hidden');
    }

    function redirectToLinkedIn() {
        const linkedInAuthUrl = 'https://www.linkedin.com/oauth/v2/authorization' +
            '?response_type=code' +
            '&client_id=8684n009xqmed6' +
            '&redirect_uri=https://ddeyc.duckdns.org/bolsa-de-trabajo/' +
            '&scope=email';
        
        window.location.href = linkedInAuthUrl;
    }

    // Show popup when needed
    showLinkedInPopup();

    // Event listeners
    closeButton?.addEventListener('click', hideLinkedInPopup);
    cancelButton?.addEventListener('click', hideLinkedInPopup);
    confirmButton?.addEventListener('click', redirectToLinkedIn);

    // Close when clicking outside
    popup?.addEventListener('click', function(event) {
        if (event.target === popup) {
            redirectToLinkedIn();
        }
    });
});