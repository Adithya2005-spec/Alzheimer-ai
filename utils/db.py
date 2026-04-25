import sqlite3
from flask import g

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    institution TEXT,
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    predicted_class TEXT NOT NULL,
    confidence REAL,
    rf_class TEXT,
    rf_confidence REAL,
    lr_class TEXT,
    lr_confidence REAL,
    probabilities TEXT,
    sentiment TEXT,
    notes TEXT,
    created_at TEXT
);
"""

def get_db(app):
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(app.config['DATABASE'])
        db.row_factory = sqlite3.Row
    return db

def init_db(app):
    with sqlite3.connect(app.config['DATABASE']) as db:
        db.executescript(SCHEMA)
        db.commit()
