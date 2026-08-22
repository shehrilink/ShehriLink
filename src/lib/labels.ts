import { COMPLAINT_CATEGORIES, type ComplaintCategory } from "@/types/database";

const CATEGORY_LABEL_MAP: Record<ComplaintCategory, string> = Object.fromEntries(
  COMPLAINT_CATEGORIES.map((c) => [c.value, c.label])
) as Record<ComplaintCategory, string>;

export function categoryLabel(category: ComplaintCategory): string {
  return CATEGORY_LABEL_MAP[category] ?? category;
}
