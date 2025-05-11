# 🧠 Interactive Learning Tool for Machine Learning

This project is a simple web-based interactive learning tool designed to introduce users to the basic concepts of Machine Learning. It provides step-by-step content, interactive quizzes, and user activity tracking.

## 🚀 Features

- **Learning Modules** – Structured learning content loaded from JSON files.
- **Interactive Quiz** – Test your knowledge through multiple-choice questions.
- **Progress Summary** – View your quiz scores and activity log.
- **User Session Tracking** – Track user activity using basic session management.

## 📸 Screenshots

### 🏠 Home Page  
![Home Page](static/images/Screenshot_Home.png)

### 📚 Interactive Learning Module  
![Interactive Learning](static/images/Screenshot_Interactive_Learning.png)

### ❓ Quiz Interface  
![Quiz](static/images/Screenshot_Quiz.png)

## 🗂️ Project Structure

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

## 🛠️ Setup and Installation

1. **Clone the repository:**
```bash
git clone https://github.com/ddavid37/Machine_Learning--The_Easy_Way.git
cd Machine_Learning--The_Easy_Way
```

2.  **Create a virtual environment (recommended):**

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
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