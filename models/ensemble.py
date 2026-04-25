"""Ensemble: confidence-weighted average of RF + LR predictions."""

import numpy as np

CLASSES = ["CN", "MCI", "Mild-AD", "Moderate-AD"]
RISK = {
    "CN":          {"level": "Low",      "color": "#00c896", "action": "Routine annual monitoring"},
    "MCI":         {"level": "Moderate", "color": "#f59e0b", "action": "6-month follow-up recommended"},
    "Mild-AD":     {"level": "High",     "color": "#ef4444", "action": "Specialist referral required"},
    "Moderate-AD": {"level": "Critical", "color": "#dc2626", "action": "Urgent specialist care"},
}

def ensemble_predict(rf: dict, lr: dict, rf_w=0.55, lr_w=0.45) -> dict:
    # Confidence-adaptive weighting
    rc, lc = rf['confidence'], lr['confidence']
    aw_rf = (rf_w * rc) / (rf_w * rc + lr_w * lc + 1e-9)
    aw_lr = 1.0 - aw_rf

    rf_p = np.array([rf['probabilities'][c] for c in CLASSES])
    lr_p = np.array([lr['probabilities'][c] for c in CLASSES])
    fused = aw_rf * rf_p + aw_lr * lr_p

    idx  = int(np.argmax(fused))
    cls  = CLASSES[idx]
    conf = float(fused[idx])
    agree = rf['predicted_class'] == lr['predicted_class']

    return {
        "predicted_class": cls,
        "confidence": round(conf, 4),
        "probabilities": {c: round(float(p), 4) for c, p in zip(CLASSES, fused)},
        "rf_weight": round(float(aw_rf), 3),
        "lr_weight": round(float(aw_lr), 3),
        "models_agree": agree,
        "risk_level": RISK[cls]["level"],
        "risk_color": RISK[cls]["color"],
        "recommended_action": RISK[cls]["action"],
        "agreement_note": (
            "✓ Both models agree — higher confidence."
            if agree else
            f"⚠ Disagreement: RF={rf['predicted_class']}, LR={lr['predicted_class']}. Further evaluation advised."
        )
    }
