import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { predict } from "@/lib/ml/tfidf-lr";
import type {
  Complaint,
  ComplaintCategory,
  ComplaintUrgency,
} from "@/types/database";

/**
 * Bump when the model bundle changes so cached rows get re-triaged on next view.
 */
export const MODEL_VERSION = "v3";

export type Triage = {
  urgency: ComplaintUrgency;
  urgencyConfidence: number;
  category: ComplaintCategory;
  categoryConfidence: number;
};

type TriageInput = Pick<Complaint, "description" | "area" | "category">;

function inputText(c: TriageInput): string {
  return [c.description, c.area].filter(Boolean).join(". ").trim();
}

export function triage(c: TriageInput): Triage {
  const text = inputText(c);
  const urgency = predict("urgency", text);
  const category = predict("category", text);
  return {
    urgency: urgency.label as ComplaintUrgency,
    urgencyConfidence: urgency.confidence,
    category: category.label as ComplaintCategory,
    categoryConfidence: category.confidence,
  };
}

function isFresh(c: Complaint): boolean {
  return c.ai_predicted_at != null && c.ai_model_version === MODEL_VERSION;
}

/**
 * Returns each complaint with AI triage fields populated, computing and
 * persisting them for any row that hasn't been triaged with the current
 * model. Best-effort: a failed write still returns the in-memory prediction.
 */
export async function withTriage<T extends Complaint>(complaints: T[]): Promise<T[]> {
  const stale = complaints.filter((c) => !isFresh(c));
  if (stale.length === 0) return complaints;

  const now = new Date().toISOString();
  const predictions = new Map<string, Triage>();
  for (const c of stale) predictions.set(c.id, triage(c));

  const supabase = createAdminClient();
  await Promise.all(
    stale.map((c) => {
      const t = predictions.get(c.id)!;
      return supabase
        .from("complaints")
        .update({
          ai_urgency: t.urgency,
          ai_urgency_confidence: t.urgencyConfidence,
          ai_category: t.category,
          ai_category_confidence: t.categoryConfidence,
          ai_predicted_at: now,
          ai_model_version: MODEL_VERSION,
        })
        .eq("id", c.id);
    })
  );

  return complaints.map((c) => {
    const t = predictions.get(c.id);
    if (!t) return c;
    return {
      ...c,
      ai_urgency: t.urgency,
      ai_urgency_confidence: t.urgencyConfidence,
      ai_category: t.category,
      ai_category_confidence: t.categoryConfidence,
      ai_predicted_at: now,
      ai_model_version: MODEL_VERSION,
    };
  });
}

export async function withTriageOne<T extends Complaint>(complaint: T): Promise<T> {
  const [result] = await withTriage([complaint]);
  return result;
}
