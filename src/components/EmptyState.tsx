export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-md border border-dashed border-border-strong bg-paper-raised px-6 py-16">
      <div className="flex items-center justify-center size-10 rounded-full bg-paper border border-border text-stone mb-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
      <p className="font-display font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-stone mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
