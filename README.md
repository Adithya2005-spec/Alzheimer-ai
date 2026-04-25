**🧠 AlzheimerAI — Intelligent Alzheimer's Detection System**

An AI-powered web application for early Alzheimer's disease detection using cognitive assessment scores, ensemble machine learning, and NLP-based clinical note analysis.
**Live Demo**:[https://alzheimer-ai-8my1.onrender.com]

**📌 Table of Contents**

Overview
Features
Tech Stack
Research Basis
Project Structure
Installation
Usage
API Endpoints
ML Models
NLP Analysis
Deployment
Known Fixes
Screenshots
Disclaimer


**Overview**
AlzheimerAI is a full-stack medical AI web application that predicts Alzheimer's disease stage using:

Cognitive assessment scores (MMSE, CDR, ADAS-Cog, FAQ, RAVLT)
Ensemble ML — Random Forest + Logistic Regression with confidence-adaptive fusion
NLP analysis — TextBlob sentiment and clinical keyword detection on doctor's notes
Longitudinal tracking — patient prediction history over multiple visits
Interactive dashboards — live Chart.js visualizations

Classification output: CN · MCI · Mild-AD · Moderate-AD

**Features**

**Feature Description**
🔐 AuthSign In / Register with session management
🧠 Predict Cognitive form with 12 clinical sliders
🤖 Ensemble MLRF + LR confidence-weighted fusion
📊 Dashboard Live stats + 3 Chart.js charts
📋 History Full prediction table with patient filter
💬 NLP TextBlob sentiment + clinical keyword scan
📈 Longitudinal Stage progression chart over time
🌐 Deploy-ready Render free-tier config included

**Tech Stack**

**Layer **                                             ** Technology**
Backend                                             Flask 3.1, Flask-CORS
Database                                            SQLite (via Python sqlite3)
ML Models                                           Random Forest + Logistic Regression (scikit-learn ≥ 1.6)
NLP                                                 TextBlob + NLTK (punkt_tab)
Frontend                                            HTML5, CSS3, Vanilla JavaScript (AJAX fetch)
Charts                                              Chart.js 4.4
Deployment                                          Render (free tier), Gunicorn

**Research Basis**
 
This project integrates findings from 15+ peer-reviewed papers (2022–2026):
Gap Identified Source
Solution Black-box models
Frontiers AI 2024
Feature importance from RF + LR coefficients
Unimodal limitation
Frontiers AI Agents 2025RF + LR ensemble fusion
Static data limitation
ScienceDirect 2025
Longitudinal visit tracking
No NLP on notes
Brain Informatics 2024
TextBlob sentiment + keyword analysis
Overfitting
MDPI Diagnostics 2024
Regularization (C=1.0) + cross-validation

**Project Structure**
alzheimer-flask/
│
├── app.py                        # Flask app — all routes + API
├── requirements.txt              # Python dependencies
├── render.yaml                   # Render deployment config
├── .gitignore
├── .gitattributes                # Line ending normalization
│
├── models/
│   ├── __init__.py
│   ├── rf_model.py               # Random Forest classifier
│   ├── lr_model.py               # Logistic Regression classifier
│   └── ensemble.py               # Confidence-adaptive RF+LR fusion
│
├── utils/
│   ├── __init__.py
│   ├── db.py                     # SQLite schema + connection helper
│   └── sentiment.py              # TextBlob NLP analysis
│
├── templates/
│   ├── signin.html               # Sign In + Register page
│   ├── dashboard.html            # Stats dashboard
│   ├── predict.html              # Cognitive assessment form + results
│   └── history.html              # Prediction history + chart
│
├── static/
│   ├── css/
│   │   └── main.css              # Full stylesheet (dark neuro-sci theme)
│   └── js/
│       ├── neural-bg.js          # Neural canvas + brain hex + wave
│       ├── signin.js             # Auth AJAX + progress animation
│       ├── dashboard.js          # Stats fetch + Chart.js rendering
│       ├── predict.js            # Prediction AJAX + results display
│       └── history.js            # History fetch + filter + chart
│
└── instance/
    ├── alzheimer.db              # SQLite database (auto-created)
    ├── rf_model.pkl              # Trained RF model (auto-created)
    └── lr_model.pkl              # Trained LR model (auto-created)

**Installation
Prerequisites**

Python 3.10 or higher
pip
Git

**Steps**
bash# **1. Clone the repository**
git clone https://github.com/Adithya2005-spec/alzheimer-ai.git
cd alzheimer-ai

# 2. Create and activate virtual environment (recommended)
python -m venv venv

# Windows
venv\Scripts\activate

# Mac / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download NLTK data for TextBlob
python -c "import nltk; nltk.download('punkt_tab'); nltk.download('averaged_perceptron_tagger_eng')"

# 5. Run the app
python app.py
App runs at → http://localhost:5000

**Usage**
1. Sign In

Go to http://localhost:5000
Enter any email + password (auto-registers on first use for demo)

**2. Dashboard**

View total predictions, average confidence, MCI/AD counts
See class distribution (doughnut), confidence timeline (line), model comparison (bar)

**3. Predict**

Enter Patient ID
Adjust 12 clinical sliders (MMSE, CDR, ADAS-Cog, etc.)
Optionally type clinical notes for NLP analysis
Click Run Analysis to get:

Final ensemble prediction + risk level
Random Forest vs Logistic Regression comparison
Feature importance bars
TextBlob sentiment + keyword detection



**4. History**

View all past predictions in a table
Filter by Patient ID
See longitudinal stage progression chart


API Endpoints
Method          Endpoint                 Description
POST/          api/auth/login        Sign in (auto-creates user for demo)
POST/          api/auth/registerRegister new user
POST/api/predict/cognitiveRun RF+LR ensemble + TextBlob NLP
GET/api/historyAll predictions (latest 50)
GET/api/history/<patient_id>Predictions for specific patient
GET/api/statsDashboard statistics
GET/api/healthHealth check
Example prediction request
bashcurl -X POST http://localhost:5000/api/predict/cognitive \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "PT-001",
    "mmse_score": 22,
    "cdr_score": 0.5,
    "adas_cog13": 25,
    "memory_score": 12,
    "orientation_score": 7,
    "faq_score": 10,
    "age": 74,
    "clinical_notes": "Patient shows memory loss and confusion."
  }'

ML Models
Random Forest

n_estimators=200, max_depth=8
Handles class imbalance via weighted sampling
Outputs per-feature importance ranking
Auto-saved to instance/rf_model.pkl

Logistic Regression

solver='lbfgs', max_iter=1000, C=1.0
Multinomial multiclass (4 classes)
Coefficient magnitudes used as feature importance
Auto-saved to instance/lr_model.pkl

Ensemble Fusion

Confidence-adaptive weighted average: RF (55%) + LR (45%)
Weights adjust dynamically based on per-prediction confidence
Modality agreement flag for clinical decision support


NLP Analysis
TextBlob analyses the clinical_notes field and returns:
OutputDescriptionpolarity−1.0 (negative) to +1.0 (positive)subjectivity0.0 (objective) to 1.0 (subjective)labelPositive / Neutral / Negativematched_keywordsClinical risk terms detectedclinical_concerntrue if ≥ 2 risk keywords foundsentencesPer-sentence polarity breakdown
Risk keywords scanned: memory loss, confusion, disorientation, forgetful, cognitive decline, dementia, agitation, wandering, deterioration, worsening, and 10+ more.

Deployment
Deploy to Render (Free Tier)
bash# 1. Push to GitHub
git add .
git commit -m "Deploy"
git push origin main

# 2. Go to https://render.com
# 3. New → Web Service → Connect your GitHub repo
# 4. Render auto-detects render.yaml
# 5. Click Deploy
The render.yaml already configures:

Build: pip install -r requirements.txt
Start: gunicorn app:app
Python version: 3.11


Known Fixes
❌ multi_class keyword error
Error: LogisticRegression.__init__() got an unexpected keyword argument 'multi_class'
Fix: Remove multi_class='multinomial' from lr_model.py — deprecated in scikit-learn ≥ 1.7.
Also delete instance/lr_model.pkl to force rebuild.

❌ punkt_tab not found
Error: Resource 'punkt_tab' not found
Fix: Run in terminal:
bashpython -c "import nltk; nltk.download('punkt_tab'); nltk.download('averaged_perceptron_tagger_eng')"

⚠️ LF/CRLF warnings on Windows
Warning: LF will be replaced by CRLF
Fix: Completely harmless. Suppress with:
bashgit config --global core.autocrlf true

Disclaimer

This application is built for educational and research purposes only.
It is not validated for clinical use and must not be used as a substitute
for professional medical diagnosis. Always consult a licensed medical professional.


License
MIT License — free to use, modify, and distribute with attribution.

Built with research integrity · 15+ papers integrated · Flask + scikit-learn + TextBlob
