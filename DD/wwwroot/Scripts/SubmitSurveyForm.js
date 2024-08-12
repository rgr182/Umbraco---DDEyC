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
            Swal.fire({
                icon: 'warning',
                title: 'Encuesta incompleta',
                text: 'Por favor, responde todas las preguntas antes de enviar la encuesta.'
            });
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
            return response.text();
        })
        .then(text => {
            // Remove the ")]}',\n" prefix if it exists
            const jsonString = text.replace(/^\)\]\}',\s*/, '');
            return JSON.parse(jsonString);
        })
        .then(data => {
            console.log('Success:', data);
            Swal.fire({
                icon: 'success',
                title: 'Encuesta enviada',
                text: 'Gracias por contestar la encuesta.'
            });
            form.reset();
            document.getElementById('survey-container').style.display = 'none';
        })
        .catch((error) => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar',
                text: 'Un error ha ocurrido al enviar la encuesta. Por favor, espera un poco e intenta de nuevo.'
            });
        });
    });
});