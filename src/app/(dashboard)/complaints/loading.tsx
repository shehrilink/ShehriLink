export default function Loading() {
  return (
    <div>
      <div className="h-8 w-40 bg-border rounded mb-5 animate-pulse" />
      <div className="h-24 bg-paper-raised border border-border rounded-md mb-5 animate-pulse" />
      <div className="rounded-md border border-border overflow-hidden">
        <div className="h-11 bg-teal-deep/20" />
        <div className="divide-y divide-border bg-paper-raised">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 px-4 flex items-center gap-6">
              <div className="h-4 w-24 bg-border rounded animate-pulse" />
              <div className="h-4 w-28 bg-border rounded animate-pulse" />
              <div className="h-4 w-32 bg-border rounded animate-pulse" />
              <div className="h-4 w-20 bg-border rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
