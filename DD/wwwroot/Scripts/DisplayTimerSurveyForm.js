document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('survey-container');

    // Check if the survey has already been completed in this session
    if (sessionStorage.getItem('surveyCompleted') === 'true') {
        container.style.display = 'none';
        return;
    }

    // Check if the survey has already been displayed this session
    if (sessionStorage.getItem('surveyDisplayed')) {
        container.style.display = 'block';
        return;
    }

    // Get the start time from sessionStorage or set it if it doesn't exist
    let startTime = sessionStorage.getItem('startTime');
    if (!startTime) {
        startTime = new Date().getTime();
        sessionStorage.setItem('startTime', startTime);
    }

    // Calculate the elapsed time
    const elapsedTime = new Date().getTime() - startTime;
    const displayTime = displayTimer * 1000;

    // Check if the elapsed time is greater than or equal to displayTime
    if (elapsedTime >= displayTime) {
        container.style.display = 'block';
        sessionStorage.setItem('surveyDisplayed', 'true');
    } else {
        setTimeout(function () {
            container.style.display = 'block';
            sessionStorage.setItem('surveyDisplayed', 'true');
        }, displayTime - elapsedTime);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('survey-container');
    const minimizeBtn = document.getElementById('minimize-btn');
    const surveyContent = document.querySelector('.survey-content');

    // Set initial state
    if (container.classList.contains('initial-minimized')) {
        minimizeBtn.textContent = '+';
        container.classList.add('minimized');
    } else {
        minimizeBtn.textContent = '−';
    }

    minimizeBtn.addEventListener('click', function() {
        container.classList.toggle('minimized');
        container.classList.remove('initial-minimized');
        if (container.classList.contains('minimized')) {
            minimizeBtn.textContent = '+';
            surveyContent.style.display = 'none';
        } else {
            minimizeBtn.textContent = '−';
            surveyContent.style.display = 'block';
        }
    });
});