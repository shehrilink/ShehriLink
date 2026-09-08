import type { ComplaintUrgency } from "@/types/database";
import { urgencyLabel } from "@/lib/labels";

const URGENCY_STYLES: Record<ComplaintUrgency, string> = {
  high: "bg-brick text-white",
  medium: "bg-amber text-white",
  low: "bg-stone text-white",
};

export function UrgencyPill({
  urgency,
  confidence,
  size = "md",
}: {
  urgency: ComplaintUrgency | null;
  confidence?: number | null;
  size?: "sm" | "md";
}) {
  if (!urgency) {
    return <span className="text-xs text-stone/60">—</span>;
  }

  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide ${pad} ${URGENCY_STYLES[urgency]}`}
      title={
        confidence != null
          ? `AI-predicted urgency · ${Math.round(confidence * 100)}% confidence`
          : "AI-predicted urgency"
      }
    >
      <span aria-hidden>⚡</span>
      {urgencyLabel(urgency)}
    </span>
  );
}
