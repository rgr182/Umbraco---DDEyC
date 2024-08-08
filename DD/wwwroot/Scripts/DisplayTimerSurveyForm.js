document.addEventListener('DOMContentLoaded', function () {
    // Check if the survey has already been displayed this session
    if (sessionStorage.getItem('surveyDisplayed')) {
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

    // Check if the elapsed time is greater than or equal to 1/2 minutes (30000 ms)
    const displayTime = 2 * 60 * 1000;
    if (elapsedTime >= displayTime) {
        var container = document.getElementById('survey-container');
        container.style.display = 'block';
        sessionStorage.setItem('surveyDisplayed', 'true');
    } else {
        // Set a timeout to display the survey when 1 minutes have passed
        setTimeout(function () {
            var container = document.getElementById('survey-container');
            container.style.display = 'block';
            sessionStorage.setItem('surveyDisplayed', 'true');
        }, displayTime - elapsedTime);
    }
});