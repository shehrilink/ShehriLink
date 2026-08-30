"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUSES } from "@/types/database";

export function ComplaintFilters({ hideStatus = false }: { hideStatus?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [area, setArea] = useState(searchParams.get("area") ?? "");

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="bg-paper-raised border border-border rounded-md p-4 mb-5">
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
          hideStatus ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onBlur={() => updateParams({ q })}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ q })}
          placeholder="Search ref #, CNIC, or name"
          className="min-w-0 rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />

        {!hideStatus && (
          <select
            defaultValue={searchParams.get("status") ?? ""}
            onChange={(e) => updateParams({ status: e.target.value || null })}
            className="min-w-0 rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
          >
            <option value="">All statuses</option>
            {COMPLAINT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        )}

        <select
          defaultValue={searchParams.get("category") ?? ""}
          onChange={(e) => updateParams({ category: e.target.value || null })}
          className="min-w-0 rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        >
          <option value="">All categories</option>
          {COMPLAINT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          onBlur={() => updateParams({ area })}
          onKeyDown={(e) => e.key === "Enter" && updateParams({ area })}
          placeholder="Area"
          className="min-w-0 rounded-md border border-border-strong bg-paper px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-[auto_1fr_auto_1fr] items-center gap-2 mt-3 sm:max-w-md">
        <span className="hidden sm:block text-xs font-medium text-stone">From</span>
        <input
          type="date"
          aria-label="From date"
          defaultValue={searchParams.get("from") ?? ""}
          onChange={(e) => updateParams({ from: e.target.value || null })}
          className="min-w-0 rounded-md border border-border-strong bg-paper px-2 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
        <span className="hidden sm:block text-xs font-medium text-stone">To</span>
        <input
          type="date"
          aria-label="To date"
          defaultValue={searchParams.get("to") ?? ""}
          onChange={(e) => updateParams({ to: e.target.value || null })}
          className="min-w-0 rounded-md border border-border-strong bg-paper px-2 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-teal-mid"
        />
      </div>

      {(searchParams.get("q") ||
        searchParams.get("status") ||
        searchParams.get("category") ||
        searchParams.get("area") ||
        searchParams.get("from") ||
        searchParams.get("to")) && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            setArea("");
            router.push(pathname);
          }}
          className="mt-3 text-xs font-medium text-teal-mid hover:text-teal-deep"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
