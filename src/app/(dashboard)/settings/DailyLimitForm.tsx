"use client";

import { useActionState } from "react";
import { saveDailyComplaintLimit } from "./actions";

export function DailyLimitForm({ initialValue }: { initialValue: string }) {
  const [state, formAction, pending] = useActionState(saveDailyComplaintLimit, {
    error: null,
    ok: false,
  });

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="daily_limit" className="block text-sm font-medium text-ink mb-1.5">
          Max complaints per citizen per day
        </label>
        <input
          id="daily_limit"
          name="daily_limit"
          type="number"
          min={1}
          step={1}
          defaultValue={initialValue}
          placeholder="No limit"
          className="w-full max-w-xs rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
        <p className="text-xs text-stone mt-1.5">
          Enforced in the ShehriLink mobile app. Leave blank to allow unlimited complaints.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-brick bg-brick/10 border border-brick/20 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      {state.ok && <p className="text-sm text-green">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-teal-deep text-paper font-medium text-sm px-4 py-2 hover:bg-teal-mid transition-colors disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
