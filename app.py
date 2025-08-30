import os
import logging
from datetime import datetime, timedelta
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from health_ai import HealthAI
from weather_service import WeatherService

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "healthcare_secret_key_2025")

# Initialize services
health_ai = HealthAI()
weather_service = WeatherService()

# In-memory storage for MVP
users = {}
lifestyle_logs = {}
user_profiles = {}

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        age = int(request.form['age'])
        gender = request.form['gender']
        location = request.form['location']
        exercise_frequency = request.form['exercise_frequency']
        sleep_hours = int(request.form['sleep_hours'])
        diet_type = request.form['diet_type']
        
        # Check if user already exists
        if email in users:
            flash('Email already registered. Please login instead.', 'error')
            return redirect(url_for('login'))
        
        # Create user
        user_id = len(users) + 1
        users[email] = {
            'id': user_id,
            'name': name,
            'email': email,
            'password_hash': generate_password_hash(password),
            'created_at': datetime.now()
        }
        
        # Create user profile
        user_profiles[user_id] = {
            'age': age,
            'gender': gender,
            'location': location,
            'exercise_frequency': exercise_frequency,
            'sleep_hours': sleep_hours,
            'diet_type': diet_type
        }
        
        # Initialize lifestyle logs
        lifestyle_logs[user_id] = []
        
        flash('Registration successful! Please login.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        
        user = users.get(email)
        if user and check_password_hash(user['password_hash'], password):
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['user_email'] = user['email']
            flash(f'Welcome back, {user["name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email or password.', 'error')
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out successfully.', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    profile = user_profiles.get(user_id, {})
    recent_logs = lifestyle_logs.get(user_id, [])[-7:]  # Last 7 days
    
    # Get personalized health tips
    health_tips = health_ai.get_personalized_tips(profile, recent_logs)
    
    # Get location-based alerts
    location_alerts = []
    if profile.get('location'):
        try:
            weather_data = weather_service.get_weather_alerts(profile['location'])
            if weather_data:
                location_alerts = health_ai.get_location_based_alerts(weather_data, profile)
        except Exception as e:
            logging.error(f"Error getting weather alerts: {e}")
    
    return render_template('dashboard.html', 
                         profile=profile, 
                         recent_logs=recent_logs,
                         health_tips=health_tips,
                         location_alerts=location_alerts)

@app.route('/lifestyle_log', methods=['GET', 'POST'])
def lifestyle_log():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    
    if request.method == 'POST':
        log_entry = {
            'date': datetime.now().date().isoformat(),
            'sleep_hours': float(request.form['sleep_hours']),
            'exercise_minutes': int(request.form['exercise_minutes']),
            'water_glasses': int(request.form['water_glasses']),
            'meals': request.form['meals'],
            'notes': request.form.get('notes', ''),
            'logged_at': datetime.now()
        }
        
        if user_id not in lifestyle_logs:
            lifestyle_logs[user_id] = []
        
        lifestyle_logs[user_id].append(log_entry)
        flash('Lifestyle data logged successfully!', 'success')
        return redirect(url_for('lifestyle_log'))
    
    # Get user's logs for the past 30 days
    user_logs = lifestyle_logs.get(user_id, [])
    return render_template('lifestyle_log.html', logs=user_logs)

@app.route('/health_tips')
def health_tips():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    profile = user_profiles.get(user_id, {})
    recent_logs = lifestyle_logs.get(user_id, [])[-14:]  # Last 14 days
    
    # Get comprehensive health tips
    tips = health_ai.get_comprehensive_health_tips(profile, recent_logs)
    
    return render_template('health_tips.html', tips=tips)

@app.route('/alerts')
def alerts():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    user_id = session['user_id']
    profile = user_profiles.get(user_id, {})
    
    alerts = []
    if profile.get('location'):
        try:
            weather_data = weather_service.get_weather_alerts(profile['location'])
            if weather_data:
                alerts = health_ai.get_detailed_location_alerts(weather_data, profile)
            else:
                alerts = [{'type': 'info', 'message': 'Weather data currently unavailable for your location.'}]
        except Exception as e:
            logging.error(f"Error getting detailed alerts: {e}")
            alerts = [{'type': 'error', 'message': 'Unable to fetch current alerts. Please try again later.'}]
    
    return render_template('alerts.html', alerts=alerts)

@app.route('/chatbot')
def chatbot():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    return render_template('chatbot.html')

@app.route('/api/chat', methods=['POST'])
def chat_api():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'error': 'Message cannot be empty'}), 400
    
    try:
        user_id = session['user_id']
        profile = user_profiles.get(user_id, {})
        response = health_ai.chat_response(message, profile)
        return jsonify({'response': response})
    except Exception as e:
        logging.error(f"Chat API error: {e}")
        return jsonify({'error': 'Sorry, I encountered an error. Please try again.'}), 500

@app.route('/api/lifestyle_chart_data')
def lifestyle_chart_data():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    user_id = session['user_id']
    logs = lifestyle_logs.get(user_id, [])
    
    # Get last 7 days of data
    recent_logs = logs[-7:] if len(logs) >= 7 else logs
    
    chart_data = {
        'labels': [],
        'sleep_data': [],
        'exercise_data': [],
        'water_data': []
    }
    
    for log in recent_logs:
        chart_data['labels'].append(log['date'])
        chart_data['sleep_data'].append(log['sleep_hours'])
        chart_data['exercise_data'].append(log['exercise_minutes'])
        chart_data['water_data'].append(log['water_glasses'])
    
    return jsonify(chart_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
