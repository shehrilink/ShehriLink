"use client";

import { useActionState } from "react";
import { createUser } from "./actions";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUser, { error: null, ok: false });

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label htmlFor="full_name" className="block text-xs font-medium text-stone mb-1">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-medium text-stone mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-xs font-medium text-stone mb-1">
          Temporary password
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="8+ characters"
          className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
      </div>

      <div>
        <label htmlFor="role" className="block text-xs font-medium text-stone mb-1">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="staff"
          className="w-full rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        >
          <option value="staff">Staff</option>
          <option value="supervisor">Supervisor</option>
        </select>
      </div>

      {state.error && (
        <p className="sm:col-span-2 text-sm text-brick bg-brick/10 border border-brick/20 rounded-md px-3 py-2">
          {state.error}
        </p>
      )}
      {state.ok && <p className="sm:col-span-2 text-sm text-green">Account created.</p>}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-teal-deep text-paper font-medium text-sm px-4 py-2 hover:bg-teal-mid transition-colors disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
        </button>
      </div>
    </form>
  );
}
