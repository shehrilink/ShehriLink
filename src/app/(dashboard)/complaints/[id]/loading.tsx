export default function Loading() {
  return (
    <div className="max-w-4xl">
      <div className="h-4 w-32 bg-border rounded mb-6 animate-pulse" />
      <div className="h-11 w-48 bg-border rounded mb-4 animate-pulse" />
      <div className="h-7 w-56 bg-border rounded mb-2 animate-pulse" />
      <div className="h-4 w-32 bg-border rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-28 bg-paper-raised border border-border rounded-md animate-pulse" />
          <div className="h-64 bg-paper-raised border border-border rounded-md animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="h-24 bg-paper-raised border border-border rounded-md animate-pulse" />
          <div className="h-32 bg-paper-raised border border-border rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}
