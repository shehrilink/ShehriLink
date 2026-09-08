import {
  COMPLAINT_CATEGORIES,
  type ComplaintCategory,
  type ComplaintUrgency,
} from "@/types/database";

const CATEGORY_LABEL_MAP: Record<ComplaintCategory, string> = Object.fromEntries(
  COMPLAINT_CATEGORIES.map((c) => [c.value, c.label])
) as Record<ComplaintCategory, string>;

export function categoryLabel(category: ComplaintCategory): string {
  return CATEGORY_LABEL_MAP[category] ?? category;
}

const URGENCY_LABEL_MAP: Record<ComplaintUrgency, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function urgencyLabel(urgency: ComplaintUrgency): string {
  return URGENCY_LABEL_MAP[urgency] ?? urgency;
}
