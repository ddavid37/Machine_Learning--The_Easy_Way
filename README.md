# Interactive Learning Tool for Machine Learning

This project is a simple web-based interactive learning tool designed to introduce users to the basic concepts of Machine Learning. It provides learning content, interactive quizzes, and tracks user progress.

## Features

- **Learning Modules:** Step-by-step learning content loaded from JSON.
- **Interactive Quiz:** Test your knowledge with multiple-choice questions.
- **Progress Summary:** View your activity log and quiz results.
- **User Session Tracking:** Basic session management to track individual user activity.

## Project Structure

```
/
├── app.py                  # Main Flask application file
├── requirements.txt        # Python dependencies
├── static/
│   ├── css/styles.css    # Custom stylesheets
│   └── js/script.js      # Frontend JavaScript
├── templates/
│   ├── index.html        # Home page template
│   ├── learn.html        # Learning content template
│   ├── quiz.html         # Quiz page template
│   └── summary.html      # User summary page template
└── data/
    ├── learning_content.json # Data for learning modules
    └── quiz_questions.json   # Data for quiz questions
```

## Setup and Installation

1.  **Clone the repository (if applicable):**

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create a virtual environment (recommended):**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the Application

1.  **Start the Flask development server:**

    ```bash
    flask run
    ```

    Or directly run the Python script:

    ```bash
    python app.py
    ```

2.  **Open your web browser** and navigate to `http://127.0.0.1:5000` (or the address provided by Flask).

## Technologies Used

- **Backend:** Python, Flask
- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **Data:** JSON