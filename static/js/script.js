document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    logUserActivity('page_load', { path: window.location.pathname });
    
    // Handle start button on home page
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', function() {
            logUserActivity('start_learning');
            window.location.href = '/learn/1';
        });
    }
    
    // Handle quiz submission
    const quizForm = document.getElementById('quiz-form');
    if (quizForm) {
        initializeQuiz();
    }
    
    // Handle interactive elements in learning pages
    setupLearningInteractions();
});

// Function to log user actions to the server
function logUserActivity(activityType, data = {}) {
    fetch('/log_action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            activity_type: activityType,
            data: data,
            timestamp: new Date().toISOString()
        })
    });
}

// Function to log specific user choices in the learning material
function logUserChoice(category, choice) {
    logUserActivity('user_choice', {
        category: category,
        choice: choice
    });
    
    // Optional: Provide visual feedback
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        <strong>Choice recorded!</strong> You selected "${choice}".
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    
    // Insert the alert after the list-group
    const listGroup = document.querySelector('.list-group');
    if (listGroup) {
        listGroup.after(alertDiv);
    }
    
    // Remove the alert after 3 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Setup interactive elements in learning pages
function setupLearningInteractions() {
    // Track button clicks
    document.querySelectorAll('button:not([data-dismiss])').forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            logUserActivity('button_click', { button_text: buttonText });
        });
    });
    
    // Track navigation between learning pages
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', function() {
            const direction = this.dataset.direction;
            logUserActivity('page_navigation', { direction: direction });
        });
    });
}

// Initialize quiz functionality
function initializeQuiz() {
    const quizForm = document.getElementById('quiz-form');
    const submitButton = document.getElementById('submit-quiz');
    const questions = document.querySelectorAll('.question-card');
    let userAnswers = {};
    
    // Handle option selection
    document.querySelectorAll('.option-btn').forEach(button => {
        button.addEventListener('click', function() {
            const questionId = this.closest('.question-card').dataset.questionId;
            const selectedOption = this.dataset.option;
            
            // Remove selection from other options in the same question
            const questionButtons = document.querySelectorAll(`.question-card[data-question-id="${questionId}"] .option-btn`);
            questionButtons.forEach(btn => btn.classList.remove('selected'));
            
            // Mark this option as selected
            this.classList.add('selected');
            
            // Store the answer
            userAnswers[questionId] = selectedOption;
            
            // Log the selected option
            logUserActivity('quiz_answer_selection', {
                question_id: questionId,
                selected_option: selectedOption
            });
            
            // Enable submit button if all questions are answered
            if (Object.keys(userAnswers).length === questions.length) {
                submitButton.disabled = false;
            }
        });
    });
    
    // Handle quiz submission
    submitButton.addEventListener('click', function() {
        // Disable submit button to prevent multiple submissions
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...';
        
        // Send answers to server
        fetch('/submit_quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userAnswers)
        })
        .then(response => response.json())
        .then(data => {
            // Show results
            displayQuizResults(data);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('There was an error submitting your quiz. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Quiz';
        });
    });
}

// Display quiz results
function displayQuizResults(data) {
    const quizContainer = document.getElementById('quiz-container');
    const resultsContainer = document.getElementById('results-container');
    
    // Hide quiz questions
    quizContainer.style.display = 'none';
    
    // Show score
    const scorePercentage = data.score.toFixed(0);
    let scoreClass = 'text-danger';
    if (scorePercentage >= 70) scoreClass = 'text-success';
    else if (scorePercentage >= 50) scoreClass = 'text-warning';
    
    let scoreHTML = `
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
    
    // Show explanations for each question
    let explanationsHTML = '<h3>Review Your Answers</h3>';
    
    data.results.forEach(result => {
        const questionElement = document.querySelector(`.question-card[data-question-id="${result.question_id}"]`);
        const questionText = questionElement.querySelector('h5').textContent;
        const options = {};
        
        // Get all options for this question
        questionElement.querySelectorAll('.option-btn').forEach(btn => {
            options[btn.dataset.option] = btn.textContent.replace(btn.dataset.option + '. ', '');
        });
        
        // Create explanation card
        explanationsHTML += `
            <div class="card mb-3">
                <div class="card-header ${result.is_correct ? 'bg-success text-white' : 'bg-danger text-white'}">
                    ${result.is_correct ? '✓ Correct' : '✗ Incorrect'}
                </div>
                <div class="card-body">
                    <h5 class="card-title">${questionText}</h5>
                    <p class="card-text">
                        <strong>Your answer:</strong> ${result.user_answer}. ${options[result.user_answer]}<br>
                        ${!result.is_correct ? `<strong>Correct answer:</strong> ${result.correct_answer}. ${options[result.correct_answer]}<br>` : ''}
                    </p>
                    <div class="explanation">
                        <strong>Explanation:</strong> ${questionElement.dataset.explanation}
                    </div>
                </div>
            </div>
        `;
    });
    
    // Add a button to go to summary or retake quiz
    const actionsHTML = `
        <div class="d-flex justify-content-between mt-4">
            <a href="/summary" class="btn btn-primary">View Summary</a>
            <a href="/learn/1" class="btn btn-outline-secondary">Review Material</a>
            <a href="/quiz" class="btn btn-success">Retake Quiz</a>
        </div>
    `;
    
    resultsContainer.innerHTML = scoreHTML + explanationsHTML + actionsHTML;
    resultsContainer.style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}