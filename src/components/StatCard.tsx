export function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "teal" | "green" | "default";
}) {
  const accentClass = {
    amber: "text-amber",
    teal: "text-teal-mid",
    green: "text-green",
    default: "text-teal-deep",
  }[accent ?? "default"];

  return (
    <div className="bg-paper-raised border border-border rounded-md px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone">{label}</p>
      <p className={`font-display font-bold text-3xl font-tabular mt-2 ${accentClass}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
