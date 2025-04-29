document.addEventListener('DOMContentLoaded', function() {
    logUserActivity('page_load', { path: window.location.pathname });

    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', function() {
            logUserActivity('start_learning');
            window.location.href = '/learn/1';
        });
    }

    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        initializeQuiz();
    }

    setupLearningInteractions();
});

// --- User activity logging ---
function logUserActivity(activityType, data = {}) {
    fetch('/log_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            activity_type: activityType,
            data: data,
            timestamp: new Date().toISOString()
        })
    });
}

function logUserChoice(category, choice) {
    logUserActivity('user_choice', { category, choice });

    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Choice recorded!</strong> You selected "${choice}".
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;

    const listGroup = document.querySelector('.list-group');
    if (listGroup) {
        listGroup.after(alertDiv);
    }

    setTimeout(() => alertDiv.remove(), 3000);
}

// --- Button tracking ---
function setupLearningInteractions() {
    document.querySelectorAll('button:not([data-dismiss])').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            logUserActivity('button_click', { button_text: buttonText });
        });
    });

    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const direction = this.dataset.direction;
            logUserActivity('page_navigation', { direction: direction });
        });
    });
}

// --- Quiz logic ---
function initializeQuiz() {
    const quizForm = document.getElementById('quiz-form');
    const submitButton = document.getElementById('submit-quiz');
    const questions = document.querySelectorAll('.question-card');
    let userAnswers = {};

    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', function() {
            const questionId = this.closest('.question-card').dataset.questionId;
            const selectedOption = this.dataset.option;

            document.querySelectorAll(`.question-card[data-question-id="${questionId}"] .option-btn`)
                .forEach(btn => btn.classList.remove('selected'));

            this.classList.add('selected');
            userAnswers[questionId] = selectedOption;

            logUserActivity('quiz_answer_selection', { question_id: questionId, selected_option: selectedOption });

            if (Object.keys(userAnswers).length === questions.length) {
                submitButton.disabled = false;
            }
        });
    });

    submitButton.addEventListener('click', function() {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';

        fetch('/submit_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userAnswers)
        })
        .then(response => response.json())
        .then(data => displayQuizResults(data))
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting your quiz. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Quiz';
        });
    });
}

function displayQuizResults(data) {
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');

    quizContainer.style.display = 'none';

    const scorePercentage = data.score.toFixed(0);
    let scoreClass = 'text-danger';
    if (scorePercentage >= 70) scoreClass = 'text-success';
    else if (scorePercentage >= 50) scoreClass = 'text-warning';

    const scoreHTML = `
        <div class="quiz-result mb-4">
            <h2>Your Score: <span class="${scoreClass}">${scorePercentage}%</span></h2>
            <p>You got ${data.correct_count} out of ${data.total_questions} questions correct.</p>
            <div class="progress">
                <div class="progress-bar ${scoreClass.replace('text-', 'bg-')}" role="progressbar"
                     style="width: ${scorePercentage}%" aria-valuenow="${scorePercentage}" 
                     aria-valuemin="0" aria-valuemax="100"></div>
            </div>
        </div>
    `;

    resultsContainer.innerHTML = scoreHTML;
    resultsContainer.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData('text', ev.target.id);
}

function drop(ev, groupId) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text');
    const draggedElement = document.getElementById(data);
    if (draggedElement && ev.target.classList.contains('basket')) {
        ev.target.appendChild(draggedElement);
        logUserActivity('drag_drop_unsupervised', { item: draggedElement.textContent, group: groupId });

        // Short delay to wait for DOM move
        setTimeout(() => {
            checkCompletion();
        }, 100);
    }
}

function checkCompletion() {
    const totalItems = 9;
    const placedItems = document.querySelectorAll('.basket .emoji-card').length;

    if (placedItems === totalItems) {
        document.getElementById('drag-drop-result').innerHTML = "<div class='alert alert-success'>✅ Great job! You grouped all the items successfully, just like unsupervised learning discovers hidden patterns!</div>";
        logUserActivity('drag_drop_unsupervised_completed');
    }
}


