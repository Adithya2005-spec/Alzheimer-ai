"""TextBlob NLP sentiment analysis on clinical notes."""
from textblob import TextBlob

SENTIMENT_LABELS = {
    (0.1, 1.0):   {"label": "Positive", "color": "#00c896", "note": "Optimistic clinical language"},
    (-0.1, 0.1):  {"label": "Neutral",  "color": "#94a3b8", "note": "Clinical/objective tone"},
    (-1.0, -0.1): {"label": "Negative", "color": "#ef4444", "note": "Concerning clinical language"},
}

ALZHEIMER_KEYWORDS = [
    "memory loss", "confusion", "disorientation", "forgetful", "cognitive decline",
    "dementia", "agitation", "wandering", "repetition", "difficulty", "impairment",
    "deterioration", "worsening", "progression", "unable"
]

def analyze_notes(text: str) -> dict:
    if not text or not text.strip():
        return None
    blob = TextBlob(text)
    polarity    = round(blob.sentiment.polarity, 3)
    subjectivity = round(blob.sentiment.subjectivity, 3)

    label_info = {"label": "Neutral", "color": "#94a3b8", "note": "Clinical/objective tone"}
    for (lo, hi), info in SENTIMENT_LABELS.items():
        if lo <= polarity < hi:
            label_info = info
            break

    # Keyword scan
    text_lower = text.lower()
    matched_keywords = [kw for kw in ALZHEIMER_KEYWORDS if kw in text_lower]

    # Noun phrases
    noun_phrases = list(blob.noun_phrases)[:5]

    # Sentence-level
    sentences = [{"text": str(s), "polarity": round(s.sentiment.polarity, 3)}
                 for s in blob.sentences]

    return {
        "polarity": polarity,
        "subjectivity": subjectivity,
        "label": label_info["label"],
        "color": label_info["color"],
        "note": label_info["note"],
        "matched_keywords": matched_keywords,
        "keyword_count": len(matched_keywords),
        "clinical_concern": len(matched_keywords) >= 2,
        "noun_phrases": noun_phrases,
        "sentence_count": len(sentences),
        "sentences": sentences[:3],
        "interpretation": (
            f"Notes contain {len(matched_keywords)} clinical risk keywords. "
            f"Sentiment: {label_info['label']} (polarity={polarity}). "
            + ("⚠ High clinical concern flagged." if len(matched_keywords) >= 2 else "")
        )
    }
