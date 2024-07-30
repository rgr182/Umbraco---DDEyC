document.addEventListener('DOMContentLoaded', function () {
    var toggleButton = document.getElementById('toggleButton');
    var formDiv = document.getElementById('formDiv');
    var googleFormIframe = document.getElementById('googleFormIframe');

    // Apply Bootstrap classes to iframe
    googleFormIframe.style.width = '100%';
    googleFormIframe.style.height = '600px'; // Adjust as necessary

    toggleButton.addEventListener('click', function () {
        if (formDiv.classList.contains('d-none')) {
            formDiv.classList.remove('d-none');
            formDiv.classList.add('d-block');
        } else {
            formDiv.classList.remove('d-block');
            formDiv.classList.add('d-none');
        }
    });
});
