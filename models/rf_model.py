"""
Random Forest Model for Alzheimer's Classification
Research basis: MDPI Diagnostics 2024 — RF outperforms single DT; handles missing data well
"""

import numpy as np
import os, joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

CLASSES = ["CN", "MCI", "Mild-AD", "Moderate-AD"]
FEATURES = [
    "mmse_score", "cdr_score", "adas_cog13", "memory_score",
    "orientation_score", "judgment_score", "faq_score",
    "ravlt_immediate", "age", "education_years", "sex_encoded",
    "prev_mmse_score", "mmse_change", "visits_count"
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../instance/rf_model.pkl')

def _build_demo_model():
    np.random.seed(42)
    X = np.random.randn(600, len(FEATURES))
    # Inject realistic signal
    y = np.zeros(600, dtype=int)
    y[X[:, 0] < -0.5] = 1   # low mmse → MCI
    y[X[:, 0] < -1.2] = 2   # very low → Mild-AD
    y[X[:, 1] >  1.0] = 3   # high CDR → Moderate-AD
    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestClassifier(n_estimators=200, max_depth=8,
                                      min_samples_split=5, random_state=42, n_jobs=-1))
    ])
    pipe.fit(X, y)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(pipe, MODEL_PATH)
    return pipe

def get_rf_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return _build_demo_model()

def _extract_features(data: dict) -> np.ndarray:
    mmse = float(data.get('mmse_score', 24))
    prev = float(data.get('prev_mmse_score', mmse))
    vec = [
        mmse,
        float(data.get('cdr_score', 0.5)),
        float(data.get('adas_cog13', 20)),
        float(data.get('memory_score', 14)),
        float(data.get('orientation_score', 8)),
        float(data.get('judgment_score', 1)),
        float(data.get('faq_score', 8)),
        float(data.get('ravlt_immediate', 35)),
        float(data.get('age', 70)),
        float(data.get('education_years', 12)),
        float(data.get('sex_encoded', 0)),
        prev,
        mmse - prev,                               # mmse_change
        float(data.get('visits_count', 1)),
    ]
    return np.array(vec).reshape(1, -1)

def predict_rf(data: dict) -> dict:
    model = get_rf_model()
    X = _extract_features(data)
    proba = model.predict_proba(X)[0]

    # Pad if model has fewer classes
    full_proba = np.zeros(4)
    for i, c in enumerate(model.classes_):
        if c < 4:
            full_proba[c] = proba[i]
    if full_proba.sum() > 0:
        full_proba /= full_proba.sum()

    idx = int(np.argmax(full_proba))

    # Feature importances
    rf = model.named_steps['rf']
    importances = [
        {"feature": f, "importance": round(float(v), 4)}
        for f, v in sorted(zip(FEATURES, rf.feature_importances_),
                           key=lambda x: -x[1])[:6]
    ]

    return {
        "model": "Random Forest",
        "predicted_class": CLASSES[idx],
        "predicted_class_idx": idx,
        "confidence": round(float(full_proba[idx]), 4),
        "probabilities": {c: round(float(p), 4) for c, p in zip(CLASSES, full_proba)},
        "feature_importances": importances,
        "n_estimators": 200,
        "research_note": "RF addresses overfitting via bagging; handles class imbalance well (MDPI 2024)"
    }
