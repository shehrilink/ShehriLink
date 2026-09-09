"""
Regenerate src/lib/ml/model-bundle.json from the trained pipelines.

Run after retraining:
    pip install scikit-learn joblib numpy
    python models/export_bundle.py
    python models/verify_parity.py   # confirm the JSON still matches the .pkl

The dashboard does inference in pure TypeScript (src/lib/ml/tfidf-lr.ts), so
the only thing it needs from Python is this JSON of weights. Both pipelines
must be TfidfVectorizer(analyzer="word") -> LogisticRegression.
"""

import json
import os
import warnings

import joblib
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

warnings.filterwarnings("ignore")

HERE = os.path.dirname(__file__)
OUT = os.path.join(HERE, "..", "src", "lib", "ml", "model-bundle.json")

SOURCES = {
    "category": os.path.join(HERE, "category_classifier_v3.pkl"),
    "urgency": os.path.join(HERE, "urgency_classifier_v3.pkl"),
}

models = {}
for name, path in SOURCES.items():
    pipe = joblib.load(path)
    vec, clf = pipe.steps[0][1], pipe.steps[1][1]
    assert vec.analyzer == "word" and vec.lowercase and vec.norm == "l2"
    assert not vec.sublinear_tf and not vec.binary and vec.use_idf
    models[name] = {
        "ngram_max": vec.ngram_range[1],
        "vocab": {term: int(i) for term, i in vec.vocabulary_.items()},
        "idf": vec.idf_.tolist(),
        "classes": [str(c) for c in clf.classes_],
        "coef": clf.coef_.tolist(),
        "intercept": clf.intercept_.tolist(),
    }
    print(f"{name}: {len(models[name]['vocab'])} terms, classes {models[name]['classes']}")

bundle = {"stop_words": sorted(ENGLISH_STOP_WORDS), "models": models}
with open(OUT, "w") as fh:
    json.dump(bundle, fh)
print(f"wrote {os.path.getsize(OUT)} bytes -> {os.path.normpath(OUT)}")
