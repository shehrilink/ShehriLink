export default function Loading() {
  return (
    <div>
      <div className="h-8 w-40 bg-border rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-paper-raised border border-border rounded-md animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-paper-raised border border-border rounded-md animate-pulse" />
        <div className="h-64 bg-paper-raised border border-border rounded-md animate-pulse" />
      </div>
    </div>
  );
}
