document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('survey-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const surveyData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            questions: []
        };

        let allQuestionsAnswered = true;

        surveyStructure.questions.forEach(question => {
            const answerInput = form.querySelector(`input[name="${question.id}"]:checked`);
            
            if (answerInput) {
                const answerObj = question.answers.find(a => a.id === answerInput.value);
                surveyData.questions.push({
                    text: question.text,
                    answer: answerObj ? answerObj.text : ''
                });
            } else {
                allQuestionsAnswered = false;
            }
        });

        if (!allQuestionsAnswered) {
            alert('Please answer all questions before submitting the survey.');
            return;
        }

        console.log('Survey data to be sent:', surveyData);

        // Send the data to the backend
        fetch('/api/Survey/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(surveyData)
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Thank you for completing the survey!');
            form.reset();
            document.getElementById('survey-container').style.display = 'none';
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while submitting the survey. Please try again.');
        });
    });
});