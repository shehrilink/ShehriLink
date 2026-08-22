"use client";

import { useState, useTransition } from "react";
import { updateUserRole, removeUser } from "./actions";
import type { AdminRole } from "@/types/database";

export function UserRow({
  email,
  fullName,
  role,
  isSelf,
}: {
  email: string;
  fullName: string | null;
  role: AdminRole;
  isSelf: boolean;
}) {
  const [currentRole, setCurrentRole] = useState(role);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (removed) return null;

  function handleRoleChange(nextRole: AdminRole) {
    setError(null);
    startTransition(async () => {
      const result = await updateUserRole(email, nextRole);
      if (result.error) setError(result.error);
      else setCurrentRole(nextRole);
    });
  }

  function handleRemove() {
    if (!confirm(`Remove ${email}? They will lose access immediately.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await removeUser(email);
      if (result.error) setError(result.error);
      else setRemoved(true);
    });
  }

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <p className="text-ink font-medium">{fullName || "—"}</p>
        <p className="text-xs text-stone">{email}</p>
        {error && <p className="text-xs text-brick mt-1">{error}</p>}
      </td>
      <td className="px-4 py-3">
        <select
          value={currentRole}
          disabled={isPending || isSelf}
          onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
          className="rounded-md border border-border-strong bg-paper px-2 py-1.5 text-sm text-ink disabled:opacity-50"
        >
          <option value="staff">Staff</option>
          <option value="supervisor">Supervisor</option>
        </select>
      </td>
      <td className="px-4 py-3 text-right">
        {!isSelf && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isPending}
            className="text-sm font-medium text-brick hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}
