import type { ComplaintStatus } from "@/types/database";

const STATUS_STYLES: Record<ComplaintStatus, string> = {
  pending: "bg-amber text-white",
  in_progress: "bg-teal-mid text-white",
  resolved: "bg-green text-white",
};

const STATUS_LABELS: Record<ComplaintStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export function StatusPill({ status }: { status: ComplaintStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
