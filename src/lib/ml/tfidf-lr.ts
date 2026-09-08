/**
 * Pure-TypeScript inference for the trained scikit-learn pipelines
 * (`TfidfVectorizer` + `LogisticRegression`). Mirrors sklearn's word
 * analyzer: lowercase → `\b\w\w+\b` tokens → drop English stop words →
 * build 1..n-grams → tf-idf (smooth idf, L2 norm) → softmax over classes.
 *
 * The weights live in `model-bundle.json`, exported from the .pkl files.
 */

import bundleJson from "./model-bundle.json";

export type ModelName = "category" | "urgency";

type ModelWeights = {
  ngram_max: number;
  vocab: Record<string, number>;
  idf: number[];
  classes: string[];
  coef: number[][]; // [nClasses][vocabSize]
  intercept: number[]; // [nClasses]
};

type Bundle = {
  stop_words: string[];
  models: Record<ModelName, ModelWeights>;
};

export type Prediction = {
  label: string;
  confidence: number; // probability of the winning class, 0..1
  scores: Record<string, number>; // probability per class
};

// sklearn's default token pattern: `(?u)\b\w\w+\b` — two-or-more word chars.
const TOKEN_RE = /[\p{L}\p{N}_][\p{L}\p{N}_]+/gu;

const bundle = bundleJson as unknown as Bundle;
const stopWords = new Set(bundle.stop_words);

function analyze(text: string, ngramMax: number, stopWords: Set<string>): string[] {
  const lowered = text.toLowerCase();
  const raw = lowered.match(TOKEN_RE) ?? [];
  const tokens = raw.filter((t) => !stopWords.has(t));

  if (ngramMax <= 1) return tokens;

  const terms: string[] = [...tokens];
  for (let n = 2; n <= ngramMax; n++) {
    for (let i = 0; i + n <= tokens.length; i++) {
      terms.push(tokens.slice(i, i + n).join(" "));
    }
  }
  return terms;
}

function softmax(values: number[]): number[] {
  const max = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

export function predict(model: ModelName, text: string): Prediction {
  const weights = bundle.models[model];
  const terms = analyze(text ?? "", weights.ngram_max, stopWords);

  // Term frequencies restricted to the known vocabulary.
  const counts = new Map<number, number>();
  for (const term of terms) {
    const idx = weights.vocab[term];
    if (idx !== undefined) counts.set(idx, (counts.get(idx) ?? 0) + 1);
  }

  // tf-idf with L2 normalisation (sklearn: sublinear_tf=False, norm="l2").
  let norm = 0;
  const tfidf = new Map<number, number>();
  for (const [idx, count] of counts) {
    const value = count * weights.idf[idx];
    tfidf.set(idx, value);
    norm += value * value;
  }
  norm = Math.sqrt(norm) || 1;

  // Logistic-regression decision function: X · coefᵀ + intercept.
  const logits = weights.intercept.map((b, c) => {
    let dot = 0;
    const row = weights.coef[c];
    for (const [idx, value] of tfidf) dot += (value / norm) * row[idx];
    return dot + b;
  });

  const probs = softmax(logits);
  let best = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[best]) best = i;

  const scores: Record<string, number> = {};
  weights.classes.forEach((label, i) => (scores[label] = probs[i]));

  return { label: weights.classes[best], confidence: probs[best], scores };
}
