# 🧠 AlzheimerAI — Flask Edition

**Tech Stack:** Flask · SQLite · Random Forest · Logistic Regression · TextBlob · Chart.js · Render

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Download TextBlob corpora
python -m textblob.download_corpora

# 3. Run
python app.py
# → http://localhost:5000
```

## 📁 Structure

```
alzheimer-flask/
├── app.py                  # Flask app + all routes
├── requirements.txt
├── render.yaml             # Render deployment config
├── models/
│   ├── rf_model.py         # Random Forest (scikit-learn)
│   ├── lr_model.py         # Logistic Regression (scikit-learn)
│   └── ensemble.py         # Confidence-adaptive RF+LR fusion
├── utils/
│   ├── db.py               # SQLite init + helpers
│   └── sentiment.py        # TextBlob NLP analysis
├── templates/
│   ├── signin.html         # Sign In / Register page
│   ├── dashboard.html      # Stats + Chart.js dashboard
│   ├── predict.html        # Cognitive assessment form
│   └── history.html        # Prediction history table
└── static/
    ├── css/main.css        # Full stylesheet
    └── js/
        ├── neural-bg.js    # Shared canvas animations
        ├── signin.js       # Auth AJAX logic
        ├── dashboard.js    # Dashboard AJAX + Chart.js
        ├── predict.js      # Prediction AJAX + results
        └── history.js      # History AJAX + filtering
```

## 🌐 Deploy to Render (Free Tier)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Render auto-detects `render.yaml` — click Deploy

## 🔬 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/register` | Register |
| POST | `/api/predict/cognitive` | RF+LR prediction + TextBlob NLP |
| GET | `/api/history/<patient_id>` | Patient history |
| GET | `/api/history` | All predictions |
| GET | `/api/stats` | Dashboard statistics |
