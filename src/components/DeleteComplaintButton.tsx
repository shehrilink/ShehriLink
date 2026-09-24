"use client";

import { useState, useTransition } from "react";
import { deleteComplaint } from "@/app/(dashboard)/complaints/[id]/actions";

export function DeleteComplaintButton({
  complaintId,
  refNumber,
  compact = false,
}: {
  complaintId: string;
  refNumber: string;
  compact?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteComplaint(complaintId);
      // On success the action redirects; we only get here on failure.
      if (result?.error) {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  if (compact) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-xs font-medium text-brick hover:underline"
          >
            Delete
          </button>
        ) : (
          <span className="inline-flex items-center gap-2 text-xs">
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="rounded bg-brick px-2 py-1 font-semibold text-white disabled:opacity-50"
            >
              {isPending ? "Deleting…" : "Confirm"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirming(false)}
              className="text-stone hover:text-ink"
            >
              Cancel
            </button>
          </span>
        )}
        {error && <span className="text-xs text-brick">{error}</span>}
      </span>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone mb-2">
        Danger zone
      </p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-md border border-brick/40 px-3.5 py-2 text-sm font-medium text-brick hover:bg-brick/5 transition-colors"
        >
          Delete complaint
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink">
            Permanently delete <span className="font-tabular font-medium">{refNumber}</span>{" "}
            along with its status history and notifications? This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={handleDelete}
              className="rounded-md bg-brick px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-wait"
            >
              {isPending ? "Deleting…" : "Yes, delete"}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setConfirming(false)}
              className="rounded-md border border-border-strong px-3.5 py-2 text-sm font-medium text-stone hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-brick mt-2">{error}</p>}
    </div>
  );
}
