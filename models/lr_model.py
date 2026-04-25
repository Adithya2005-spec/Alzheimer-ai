"""
Logistic Regression Model for Alzheimer's Classification
Research basis: Nature Sci Reports 2024 — LR provides probabilistic baseline with interpretable coefficients
"""

import numpy as np
import os, joblib
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

CLASSES = ["CN", "MCI", "Mild-AD", "Moderate-AD"]
FEATURES = [
    "mmse_score", "cdr_score", "adas_cog13", "memory_score",
    "orientation_score", "judgment_score", "faq_score",
    "ravlt_immediate", "age", "education_years", "sex_encoded",
    "prev_mmse_score", "mmse_change", "visits_count"
]

MODEL_PATH = os.path.join(os.path.dirname(__file__), '../instance/lr_model.pkl')

def _build_demo_model():
    np.random.seed(123)
    X = np.random.randn(600, len(FEATURES))
    y = np.zeros(600, dtype=int)
    y[X[:, 0] < -0.4] = 1
    y[X[:, 0] < -1.1] = 2
    y[X[:, 1] >  1.1] = 3
    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('lr', LogisticRegression(
            solver='lbfgs',
            max_iter=1000, C=1.0, random_state=42
        ))
    ])
    pipe.fit(X, y)
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(pipe, MODEL_PATH)
    return pipe

def get_lr_model():
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)
    return _build_demo_model()

def _extract_features(data: dict) -> np.ndarray:
    mmse = float(data.get('mmse_score', 24))
    prev = float(data.get('prev_mmse_score', mmse))
    return np.array([
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
        prev, mmse - prev,
        float(data.get('visits_count', 1)),
    ]).reshape(1, -1)

def predict_lr(data: dict) -> dict:
    model = get_lr_model()
    X = _extract_features(data)
    proba = model.predict_proba(X)[0]

    full_proba = np.zeros(4)
    for i, c in enumerate(model.classes_):
        if c < 4:
            full_proba[c] = proba[i]
    if full_proba.sum() > 0:
        full_proba /= full_proba.sum()

    idx = int(np.argmax(full_proba))

    # Coefficient magnitudes as "importance"
    lr = model.named_steps['lr']
    coef_mean = np.abs(lr.coef_).mean(axis=0)
    importances = [
        {"feature": f, "importance": round(float(v), 4)}
        for f, v in sorted(zip(FEATURES, coef_mean), key=lambda x: -x[1])[:6]
    ]

    return {
        "model": "Logistic Regression",
        "predicted_class": CLASSES[idx],
        "predicted_class_idx": idx,
        "confidence": round(float(full_proba[idx]), 4),
        "probabilities": {c: round(float(p), 4) for c, p in zip(CLASSES, full_proba)},
        "feature_importances": importances,
        "solver": "lbfgs / multinomial",
        "research_note": "LR provides interpretable probabilistic predictions (Nature Sci Reports 2024)"
    }
