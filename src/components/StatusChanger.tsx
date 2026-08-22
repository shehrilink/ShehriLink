"use client";

import { useState, useTransition } from "react";
import { clsx } from "clsx";
import { COMPLAINT_STATUSES, type ComplaintStatus } from "@/types/database";
import { updateComplaintStatus } from "@/app/(dashboard)/complaints/[id]/actions";

const ORDER: ComplaintStatus[] = ["pending", "in_progress", "resolved"];

const ACTIVE_STYLES: Record<ComplaintStatus, string> = {
  pending: "border-amber bg-amber/10 text-amber",
  in_progress: "border-teal-mid bg-teal-mid/10 text-teal-mid",
  resolved: "border-green bg-green/10 text-green",
};

export function StatusChanger({
  complaintId,
  status,
}: {
  complaintId: string;
  status: ComplaintStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(next: ComplaintStatus) {
    if (next === current) return;
    setError(null);
    startTransition(async () => {
      const result = await updateComplaintStatus(complaintId, current, next);
      if (result.error) {
        setError(result.error);
      } else {
        setCurrent(next);
      }
    });
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone mb-2">Status</p>
      <div className="flex flex-wrap gap-2">
        {ORDER.map((value) => {
          const meta = COMPLAINT_STATUSES.find((s) => s.value === value)!;
          const isActive = value === current;
          return (
            <button
              key={value}
              type="button"
              disabled={isPending}
              onClick={() => handleChange(value)}
              className={clsx(
                "rounded-md border px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-wait",
                isActive
                  ? ACTIVE_STYLES[value]
                  : "border-border-strong bg-paper-raised text-stone hover:border-teal-mid hover:text-teal-mid"
              )}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-sm text-brick mt-2">{error}</p>}
    </div>
  );
}
