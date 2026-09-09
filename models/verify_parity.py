"""
Parity check: does src/lib/ml/model-bundle.json reproduce the .pkl pipelines?

    pip install scikit-learn joblib numpy
    python models/verify_parity.py

Re-implements the same inference the dashboard's tfidf-lr.ts does (lowercase ->
`\\b\\w\\w+\\b` tokens -> drop English stop words -> 1..n-grams -> tf-idf, L2
norm -> logistic-regression softmax) straight from the exported JSON, and
compares the class probabilities against scikit-learn's predict_proba on a
sample. Exits non-zero if the two disagree by more than 1e-4.

Run this at export time and after every retrain (see export_bundle.py).
"""

import json
import math
import os
import re
import warnings

import joblib

warnings.filterwarnings("ignore")

HERE = os.path.dirname(__file__)
BUNDLE = os.path.join(HERE, "..", "src", "lib", "ml", "model-bundle.json")
PKLS = {
    "category": os.path.join(HERE, "category_classifier_v3.pkl"),
    "urgency": os.path.join(HERE, "urgency_classifier_v3.pkl"),
}
TOKEN_RE = re.compile(r"\b\w\w+\b", re.UNICODE)  # scikit-learn's default token_pattern

SAMPLES = [
    "sewage water overflowing onto the main road, children walk through it every morning",
    "one street light flickers occasionally near the park",
    "garbage has not been collected from our lane for eight days",
    "huge pothole opened up on the bridge after the rain, a car was damaged",
    "no water supply in the whole block since yesterday afternoon",
    "manhole cover missing on the footpath, someone could fall in at night",
]


def analyze(text, ngram_max, stop_words):
    tokens = [t for t in TOKEN_RE.findall(text.lower()) if t not in stop_words]
    terms = list(tokens)
    for n in range(2, ngram_max + 1):
        for i in range(len(tokens) - n + 1):
            terms.append(" ".join(tokens[i : i + n]))
    return terms


def predict_from_bundle(model, text, stop_words):
    counts = {}
    for term in analyze(text, model["ngram_max"], stop_words):
        idx = model["vocab"].get(term)
        if idx is not None:
            counts[idx] = counts.get(idx, 0) + 1

    tfidf = {i: c * model["idf"][i] for i, c in counts.items()}
    norm = math.sqrt(sum(v * v for v in tfidf.values())) or 1.0

    logits = []
    for c, b in enumerate(model["intercept"]):
        row = model["coef"][c]
        logits.append(sum((v / norm) * row[i] for i, v in tfidf.items()) + b)

    m = max(logits)
    exps = [math.exp(x - m) for x in logits]
    s = sum(exps)
    return {cls: e / s for cls, e in zip(model["classes"], exps)}


def main():
    bundle = json.load(open(BUNDLE))
    stop_words = set(bundle["stop_words"])
    worst = 0.0

    for name, path in PKLS.items():
        pipe = joblib.load(path)
        model = bundle["models"][name]
        classes = list(pipe.classes_)
        for text in SAMPLES:
            sk = dict(zip(classes, pipe.predict_proba([text])[0]))
            ts = predict_from_bundle(model, text, stop_words)
            diff = max(abs(sk[c] - ts[c]) for c in classes)
            worst = max(worst, diff)
            flag = "" if diff < 1e-4 else "  <-- MISMATCH"
            print(f"[{name:8}] dmax={diff:.2e}  {text[:50]!r}{flag}")

    print(f"\nworst per-class probability difference: {worst:.2e}")
    raise SystemExit(0 if worst < 1e-4 else 1)


if __name__ == "__main__":
    main()
