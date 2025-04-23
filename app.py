from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import json
import uuid
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = "ml_learning_tool_secret_key"  # For session management

# Load data from JSON files
def load_json_data(filename):
    with open(os.path.join('data', filename), 'r') as file:
        return json.load(file)

# Function to log user activity
def log_user_activity(activity_type, data=None):
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        session['activities'] = []
    
    activity = {
        'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        'type': activity_type,
        'data': data
    }
    
    session['activities'].append(activity)
    session.modified = True
    return activity

@app.route('/')
def home():
    log_user_activity('page_view', {'page': 'home'})
    return render_template('index.html')

@app.route('/learn/<int:page_id>')
def learn(page_id):
    learning_content = load_json_data('learning_content.json')
    
    # Validate page_id
    if page_id < 1 or page_id > len(learning_content):
        return redirect(url_for('learn', page_id=1))
    
    current_page = learning_content[page_id-1]
    log_user_activity('learning_page_view', {
        'page_id': page_id,
        'page_title': current_page['title']
    })
    
    return render_template(
        'learn.html',
        content=current_page,
        current_page=page_id,
        total_pages=len(learning_content)
    )

@app.route('/quiz')
def quiz():
    questions = load_json_data('quiz_questions.json')
    log_user_activity('quiz_start')
    return render_template('quiz.html', questions=questions)

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    answers = request.json
    questions = load_json_data('quiz_questions.json')
    
    # Calculate score
    correct_count = 0
    results = []
    
    for q_id, answer in answers.items():
        q_index = int(q_id.replace('q', '')) - 1
        question = questions[q_index]
        is_correct = answer == question['correct_answer']
        
        if is_correct:
            correct_count += 1
            
        results.append({
            'question_id': q_id,
            'user_answer': answer,
            'correct_answer': question['correct_answer'],
            'is_correct': is_correct
        })
    
    score_percentage = (correct_count / len(questions)) * 100
    
    # Log quiz results
    log_user_activity('quiz_submission', {
        'results': results,
        'score': score_percentage
    })
    
    return jsonify({
        'score': score_percentage,
        'correct_count': correct_count,
        'total_questions': len(questions),
        'results': results
    })

@app.route('/summary')
def summary():
    if 'activities' not in session:
        return redirect(url_for('home'))
    
    # Find quiz result if exists
    quiz_result = None
    for activity in session['activities']:
        if activity['type'] == 'quiz_submission':
            quiz_result = activity['data']
            break
    
    log_user_activity('summary_view')
    return render_template('summary.html', 
                          activities=session['activities'],
                          quiz_result=quiz_result)

@app.route('/log_action', methods=['POST'])
def log_action():
    data = request.json
    activity = log_user_activity(data['activity_type'], data.get('data'))
    return jsonify({'status': 'success', 'activity': activity})

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    if not os.path.exists('data'):
        os.makedirs('data')
    
    app.run(debug=True)