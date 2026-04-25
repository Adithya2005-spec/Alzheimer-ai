**🧠 AlzheimerAI — Intelligent Alzheimer's Detection System
**
An AI-powered web application for early-stage Alzheimer’s detection using cognitive assessments, ensemble machine learning, and NLP-based clinical analysis.

🔗 Live Demo: https://alzheimer-ai-8my1.onrender.com

------

**🚀 Overview**

AlzheimerAI is a full-stack medical AI system designed to assist in early detection and monitoring of Alzheimer’s disease.

It combines:

🧪 Cognitive test scores
🤖 Ensemble machine learning
💬 Clinical text analysis (NLP)
📊 Longitudinal patient tracking
🎯 Output Classes
CN (Cognitively Normal)
MCI (Mild Cognitive Impairment)
Mild-AD
Moderate-AD

------
**🧩 Key Features**
**🔐 Authentication**
Simple sign-in/register flow
Session-based authentication
**🧠 Cognitive Prediction Engine**
12 clinical input parameters (MMSE, CDR, ADAS-Cog, etc.)
Real-time prediction with confidence score
**🤖 Ensemble ML System**
Random Forest + Logistic Regression
Confidence-adaptive fusion
Model agreement indicator
**💬 NLP Clinical Analysis**
Sentiment analysis (TextBlob)
Risk keyword detection
Clinical concern flagging
**📊 Dashboard & Visualization**
Real-time analytics using Chart.js
Class distribution, confidence trends, model comparison
**📈 Longitudinal Tracking**
Patient-wise prediction history
Disease progression over time

-----

**🏗️ Tech Stack**
Layer	                                                                 Technology
Backend	                                                               Flask 3.1, Flask-CORS
Database	                                                              SQLite
ML Models	                                                             scikit-learn (RF + LR)
NLP	                                                                   TextBlob, NLTK
Frontend	                                                              HTML, CSS, Vanilla JS
Charts	                                                                Chart.js
Deployment	                                                            Render + Gunicorn

----

**🧠 System Architecture**
User Input → Cognitive Scores + Notes
           ↓
     ML Models (RF + LR)
           ↓
  Ensemble Fusion Engine
           ↓
   NLP Analysis (TextBlob)
           ↓
 Prediction + Insights + Charts
           ↓
     Stored in Database

----

**🔬 Research Foundation**

Built using insights from 15+ research papers (2022–2026):

Problem	                                                                    Solution
Black-box                                                                   ML	Feature importance from RF + LR
Single-model bias	                                                          Ensemble fusion
Static predictions	                                                         Longitudinal tracking
Ignored clinical notes	                                                     NLP integration
Overfitting	                                                                Regularization + cross-validation

------

**📂 Project Structure**
alzheimer-flask/
│
├── app.py                # Main Flask app
├── requirements.txt
├── render.yaml
│
├── models/               # ML models
│   ├── rf_model.py
│   ├── lr_model.py
│   └── ensemble.py
│
├── utils/
│   ├── db.py             # Database logic
│   └── sentiment.py      # NLP analysis
│
├── templates/            # HTML pages
├── static/               # CSS + JS
│
└── instance/             # DB + trained models

----

**⚙️ Installation**

**Prerequisites**
Python 3.10+
pip
Git

**Steps**

# Clone repo
git clone https://github.com/Adithya2005-spec/alzheimer-ai.git
cd alzheimer-ai

# Create virtual environment
python -m venv venv

# Activate
venv\Scripts\activate     # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Download NLP data
python -c "import nltk; nltk.download('punkt_tab'); nltk.download('averaged_perceptron_tagger_eng')"

# Run app
python app.py

👉 App runs at: http://localhost:5000

----

**🧪 Usage**
**1. Login**
Enter email + password (auto-register enabled)
**2. Dashboard**
View stats, trends, and model insights
**3. Prediction**
Enter patient data
Adjust clinical sliders
Add optional notes
Get:
Disease stage
Confidence score
Model comparison
NLP insights
**4. History**
Filter by patient ID
View disease progression

-----

**🔌 API Endpoints**
Method	                          Endpoint	                                            Description
POST	                             /api/auth/login	                                     Login
POST	                            /api/auth/register	                                   Register
POST	                           /api/predict/cognitive	                                Run prediction
GET	                           /api/history	                                           Get recent predictions
GET	                          /api/history/<id>	                                       Patient-specific history
GET	                         /api/stats	                                               Dashboard stats
GET	                        /api/health	                                               Health check


--------

**🤖 ML Models**
**Random Forest**
200 trees, depth = 8
Handles class imbalance
Feature importance extraction
**Logistic Regression**
Multiclass classification
Regularized (C=1.0)
Coefficient-based explainability
**Ensemble Fusion**
RF (55%) + LR (45%)
Dynamic confidence weighting
Agreement-based validation

------

**💬 NLP Analysis**
Analyzes clinical notes using TextBlob:

Sentiment (Positive / Neutral / Negative)
Polarity & subjectivity
Risk keyword detection:
memory loss, confusion, disorientation, etc.
Clinical concern flag (≥2 keywords)

------

**🚀 Deployment**
Deployed on Render (Free Tier)
git add .
git commit -m "Deploy"
git push origin main

Render auto-config:
Build: pip install -r requirements.txt
Start: gunicorn app:app

--------

**⚠️ Known Issues & Fixes**
**Logistic Regression Error**
Remove multi_class parameter
Delete old .pkl file

**NLTK Error**
nltk.download('punkt_tab')

**Git LF/CRLF Warning**
git config --global core.autocrlf true

-----

**⚠️ Disclaimer**
This project is for educational and research purposes only.

It is not medically validated and should not be used for real clinical decisions.

------

**📜 License**
MIT License — free to use and modify.
