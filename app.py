from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
import os
from datetime import datetime

app = Flask(__name__)

# Simple in-memory database (replace with real database in production)
MISSING_PERSONS_FILE = 'missing_persons.json'
FOUND_PERSONS_FILE = 'found_persons.json'

def load_data(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_data(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    missing_persons = load_data(MISSING_PERSONS_FILE)
    found_persons = load_data(FOUND_PERSONS_FILE)
    return render_template('index.html', 
                         missing_persons=missing_persons[:6],
                         found_persons=found_persons[:3])

@app.route('/browse')
def browse():
    missing_persons = load_data(MISSING_PERSONS_FILE)
    regions = list(set(person.get('region', '') for person in missing_persons if person.get('region')))
    return render_template('index.html', 
                         missing_persons=missing_persons,
                         regions=regions,
                         browse_page=True)

@app.route('/report-missing', methods=['GET', 'POST'])
def report_missing():
    if request.method == 'POST':
        # Handle form submission
        new_person = {
            'id': len(load_data(MISSING_PERSONS_FILE)) + 1,
            'name': request.form.get('name'),
            'age': request.form.get('age'),
            'gender': request.form.get('gender'),
            'last_seen': request.form.get('last_seen'),
            'last_seen_date': request.form.get('last_seen_date'),
            'region': request.form.get('region'),
            'description': request.form.get('description'),
            'contact_name': request.form.get('contact_name'),
            'contact_phone': request.form.get('contact_phone'),
            'contact_email': request.form.get('contact_email'),
            'photo_url': '/static/images/default-avatar.png',  # Default image
            'date_reported': datetime.now().strftime('%Y-%m-%d')
        }
        
        missing_persons = load_data(MISSING_PERSONS_FILE)
        missing_persons.append(new_person)
        save_data(MISSING_PERSONS_FILE, missing_persons)
        
        return jsonify({'success': True, 'message': 'Report submitted successfully'})
    
    return render_template('index.html', report_page=True)

@app.route('/report-sighting', methods=['POST'])
def report_sighting():
    data = request.get_json()
    # In a real app, you would save this to a database
    print(f"Sighting reported: {data}")
    return jsonify({'success': True, 'message': 'Sighting report received'})

@app.route('/volunteer-signup', methods=['POST'])
def volunteer_signup():
    data = request.get_json()
    # In a real app, you would save this to a database
    print(f"Volunteer signed up: {data}")
    return jsonify({'success': True, 'message': 'Thank you for signing up as a volunteer'})

@app.route('/search')
def search():
    query = request.args.get('q', '').lower()
    region = request.args.get('region', '')
    
    missing_persons = load_data(MISSING_PERSONS_FILE)
    
    if query:
        missing_persons = [p for p in missing_persons if 
                          query in p.get('name', '').lower() or 
                          query in p.get('description', '').lower()]
    
    if region:
        missing_persons = [p for p in missing_persons if p.get('region') == region]
    
    return jsonify(missing_persons)

if __name__ == '__main__':
    # Create sample data files if they don't exist
    if not os.path.exists(MISSING_PERSONS_FILE):
        sample_missing = [
            {
                'id': 1,
                'name': 'Sarah Johnson',
                'age': 28,
                'gender': 'Female',
                'last_seen': 'Central Park, New York',
                'last_seen_date': '2024-01-15',
                'region': 'Northeast',
                'description': 'Last seen wearing blue jeans and a red jacket. Brown hair, green eyes.',
                'contact_name': 'Michael Johnson',
                'contact_phone': '(555) 123-4567',
                'contact_email': 'm.johnson@email.com',
                'photo_url': '/static/images/default-avatar.png',
                'date_reported': '2024-01-16'
            },
            {
                'id': 2,
                'name': 'David Chen',
                'age': 45,
                'gender': 'Male',
                'last_seen': 'Downtown Seattle',
                'last_seen_date': '2024-01-10',
                'region': 'Northwest',
                'description': 'Height 6\'2", black hair, glasses. Last seen in business attire.',
                'contact_name': 'Lisa Chen',
                'contact_phone': '(555) 987-6543',
                'contact_email': 'l.chen@email.com',
                'photo_url': '/static/images/default-avatar.png',
                'date_reported': '2024-01-11'
            }
        ]
        save_data(MISSING_PERSONS_FILE, sample_missing)
    
    if not os.path.exists(FOUND_PERSONS_FILE):
        sample_found = [
            {
                'id': 1,
                'name': 'Emily Rodriguez',
                'age': 32,
                'found_date': '2024-01-05',
                'reunited_with': 'Family in Miami',
                'photo_url': '/static/images/default-avatar.png'
            }
        ]
        save_data(FOUND_PERSONS_FILE, sample_found)
    
    app.run(debug=True)