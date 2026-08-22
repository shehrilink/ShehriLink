"use client";

import { useState } from "react";

export function CategoryBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const isHovered = hovered === d.label;
        return (
          <div
            key={d.label}
            className="group"
            onMouseEnter={() => setHovered(d.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-ink">{d.label}</span>
              <span className="font-tabular text-stone">{d.count}</span>
            </div>
            <div className="h-3 rounded-sm bg-border/60 overflow-hidden">
              <div
                className={`h-full rounded-sm transition-[width,opacity] duration-200 ${
                  isHovered ? "bg-teal-deep" : "bg-teal-mid"
                }`}
                style={{ width: `${Math.max(pct, d.count > 0 ? 2 : 0)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
