-- Adds AI triage columns to `complaints`. When the dashboard opens a
-- complaint (list or detail) it runs the trained TF-IDF + LogisticRegression
-- models over the description + area + citizen-selected category and caches
-- the result here, so inference only ever runs once per complaint.
--
--   ai_urgency          'low' | 'medium' | 'high'
--   ai_category         predicted category (same 5 values as `category`)
--   ai_*_confidence     winning-class probability, 0..1
--   ai_predicted_at     null = not yet triaged
--   ai_model_version    lets a future model re-triage rows on version bump

alter table complaints
  add column if not exists ai_urgency text
    check (ai_urgency in ('low', 'medium', 'high')),
  add column if not exists ai_urgency_confidence real,
  add column if not exists ai_category text,
  add column if not exists ai_category_confidence real,
  add column if not exists ai_predicted_at timestamptz,
  add column if not exists ai_model_version text;

-- Fast lookup of complaints still needing triage.
create index if not exists complaints_ai_pending_idx
  on complaints (created_at desc)
  where ai_predicted_at is null;
