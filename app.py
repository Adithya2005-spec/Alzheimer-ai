"""
AlzheimerAI — Flask Backend
Tech Stack: Flask · SQLite · Random Forest · Logistic Regression · TextBlob
"""

from flask import Flask, jsonify, request, render_template, g
from flask_cors import CORS
import sqlite3, os, json, uuid
from datetime import datetime

from models.rf_model import predict_rf
from models.lr_model import predict_lr
from models.ensemble import ensemble_predict
from utils.sentiment import analyze_notes
from utils.db import init_db, get_db

app = Flask(__name__)
CORS(app)
app.config['DATABASE'] = os.path.join(app.instance_path, 'alzheimer.db')
app.config['SECRET_KEY'] = 'alzheimer-ai-secret-2024'
os.makedirs(app.instance_path, exist_ok=True)

# ── DB teardown ───────────────────────────────────────────────────────────────
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# ── Pages ─────────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('signin.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/predict-page')
def predict_page():
    return render_template('predict.html')

@app.route('/history-page')
def history_page():
    return render_template('history.html')

# ── Auth ──────────────────────────────────────────────────────────────────────
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()
    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400
    db = get_db(app)
    user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    if not user:
        # Auto-create for demo
        db.execute('INSERT INTO users (id, name, email, institution, created_at) VALUES (?,?,?,?,?)',
                   (str(uuid.uuid4()), email.split('@')[0].title(), email, 'Demo Institution', datetime.utcnow().isoformat()))
        db.commit()
        user = db.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    return jsonify({'success': True, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}})

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    db = get_db(app)
    existing = db.execute('SELECT id FROM users WHERE email = ?', (data.get('email'),)).fetchone()
    if existing:
        return jsonify({'error': 'Email already registered'}), 409
    uid = str(uuid.uuid4())
    db.execute('INSERT INTO users (id, name, email, institution, created_at) VALUES (?,?,?,?,?)',
               (uid, data.get('name'), data.get('email'), data.get('institution',''), datetime.utcnow().isoformat()))
    db.commit()
    return jsonify({'success': True, 'user_id': uid})

# ── Prediction ────────────────────────────────────────────────────────────────
@app.route('/api/predict/cognitive', methods=['POST'])
def predict_cognitive():
    data = request.get_json()
    try:
        rf_result   = predict_rf(data)
        lr_result   = predict_lr(data)
        final       = ensemble_predict(rf_result, lr_result)

        # Sentiment on clinical notes
        notes       = data.get('clinical_notes', '')
        sentiment   = analyze_notes(notes) if notes else None

        prediction_id = str(uuid.uuid4())
        db = get_db(app)
        db.execute('''INSERT INTO predictions
            (id, patient_id, predicted_class, confidence, rf_class, rf_confidence,
             lr_class, lr_confidence, probabilities, sentiment, notes, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
            (prediction_id,
             data.get('patient_id', 'UNKNOWN'),
             final['predicted_class'], final['confidence'],
             rf_result['predicted_class'], rf_result['confidence'],
             lr_result['predicted_class'], lr_result['confidence'],
             json.dumps(final['probabilities']),
             json.dumps(sentiment) if sentiment else None,
             notes,
             datetime.utcnow().isoformat()))
        db.commit()

        return jsonify({
            'prediction_id': prediction_id,
            'final': final,
            'random_forest': rf_result,
            'logistic_regression': lr_result,
            'sentiment': sentiment,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ── History ───────────────────────────────────────────────────────────────────
@app.route('/api/history/<patient_id>', methods=['GET'])
def get_history(patient_id):
    db = get_db(app)
    rows = db.execute(
        'SELECT * FROM predictions WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20',
        (patient_id,)).fetchall()
    return jsonify({'patient_id': patient_id, 'predictions': [dict(r) for r in rows]})

@app.route('/api/history', methods=['GET'])
def all_history():
    db = get_db(app)
    rows = db.execute(
        'SELECT * FROM predictions ORDER BY created_at DESC LIMIT 50').fetchall()
    return jsonify({'predictions': [dict(r) for r in rows]})

# ── Stats ─────────────────────────────────────────────────────────────────────
@app.route('/api/stats', methods=['GET'])
def stats():
    db = get_db(app)
    total   = db.execute('SELECT COUNT(*) FROM predictions').fetchone()[0]
    by_class = db.execute(
        'SELECT predicted_class, COUNT(*) as cnt FROM predictions GROUP BY predicted_class'
    ).fetchall()
    avg_conf = db.execute('SELECT AVG(confidence) FROM predictions').fetchone()[0]
    recent   = db.execute(
        'SELECT predicted_class, confidence, created_at FROM predictions ORDER BY created_at DESC LIMIT 5'
    ).fetchall()
    return jsonify({
        'total_predictions': total,
        'by_class': {r['predicted_class']: r['cnt'] for r in by_class},
        'avg_confidence': round(avg_conf or 0, 3),
        'recent': [dict(r) for r in recent]
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'stack': 'Flask+SQLite+RF+LR+TextBlob'})

# ── Init & Run ─────────────────────────────────────────────────────────────────
with app.app_context():
    init_db(app)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
