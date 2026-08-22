"use client";

import { useActionState } from "react";
import { saveWebhookUrl } from "./actions";

export function WebhookForm({ initialValue }: { initialValue: string }) {
  const [state, formAction, pending] = useActionState(saveWebhookUrl, {
    error: null,
    ok: false,
  });

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="webhook_url" className="block text-sm font-medium text-ink mb-1.5">
          n8n status-update webhook URL
        </label>
        <input
          id="webhook_url"
          name="webhook_url"
          type="url"
          defaultValue={initialValue}
          placeholder="https://n8n.example.com/webhook/status-update"
          className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
        <p className="text-xs text-stone mt-1.5">
          Called with <code className="font-tabular">{"{ complaint_id, status }"}</code> whenever a
          complaint&apos;s status changes, so the citizen can be notified on WhatsApp.
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
