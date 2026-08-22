import Link from "next/link";

export function Pagination({
  page,
  pageSize,
  total,
  searchParams,
  basePath = "/complaints",
}: {
  page: number;
  pageSize: number;
  total: number;
  searchParams: Record<string, string | undefined>;
  basePath?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-5 text-sm">
      <p className="text-stone font-tabular">
        {start}–{end} of {total}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={`rounded-md border border-border-strong px-3 py-1.5 font-medium ${
            page <= 1
              ? "pointer-events-none opacity-40"
              : "text-ink hover:border-teal-mid hover:text-teal-mid"
          }`}
        >
          Previous
        </Link>
        <span className="px-2 py-1.5 text-stone font-tabular">
          {page} / {totalPages}
        </span>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={`rounded-md border border-border-strong px-3 py-1.5 font-medium ${
            page >= totalPages
              ? "pointer-events-none opacity-40"
              : "text-ink hover:border-teal-mid hover:text-teal-mid"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
