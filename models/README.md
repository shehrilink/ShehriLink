# AI triage models

Two scikit-learn pipelines — `TfidfVectorizer(analyzer="word")` → `LogisticRegression` —
that predict a complaint's **urgency** and **category** from its text.

| file | output classes |
|---|---|
| `urgency_classifier_v3.pkl` | `low`, `medium`, `high` |
| `category_classifier_v3.pkl` | `garbage`, `road_damage`, `sewage`, `street_light`, `water_supply` |

## How it's used

The dashboard does **not** run Python. `export_bundle.py` flattens the pipeline
weights (vocabulary, IDF, coefficients, the English stop-word list) into
[`../src/lib/ml/model-bundle.json`](../src/lib/ml/model-bundle.json), and
[`../src/lib/ml/tfidf-lr.ts`](../src/lib/ml/tfidf-lr.ts) reimplements the
inference in TypeScript. Output matches sklearn to floating-point precision.

Complaints are triaged lazily the first time the list or detail page loads them
(`src/lib/ml/triage.ts`) and cached in `complaints.ai_*` columns
(migration `supabase/migration-006-ai-triage.sql`). `POST /api/triage-backfill`
(signed in as an admin) scores the whole backlog at once.

## Retraining

```bash
pip install scikit-learn joblib numpy
# drop the new *_v3.pkl files here, then:
python models/export_bundle.py     # .pkl -> ../src/lib/ml/model-bundle.json
python models/verify_parity.py     # asserts the JSON reproduces the .pkl (< 1e-4)
```

Bump `MODEL_VERSION` in `src/lib/ml/triage.ts` so already-scored complaints get
re-triaged. If the version bump matters, also `POST /api/triage-backfill`.

> The `.pkl` files must be committed/transferred as **binary** (`.gitattributes`
> enforces this) — the originals arrived corrupted at the first pickle frame
> boundary because of newline/encoding mangling.
