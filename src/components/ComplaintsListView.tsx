import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComplaintFilters } from "@/components/ComplaintFilters";
import { Pagination } from "@/components/Pagination";
import { StatusPill } from "@/components/StatusPill";
import { RefStamp } from "@/components/RefStamp";
import { EmptyState } from "@/components/EmptyState";
import { categoryLabel } from "@/lib/labels";
import { formatWhen } from "@/lib/format";
import type { ComplaintCategory, ComplaintStatus } from "@/types/database";

const PAGE_SIZE = 25;

export async function ComplaintsListView({
  params,
  basePath,
  lockedStatus,
  emptyTitle,
  emptyDescription,
}: {
  params: Record<string, string | undefined>;
  basePath: string;
  lockedStatus?: ComplaintStatus;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const page = Math.max(1, Number(params.page) || 1);
  const supabase = await createClient();

  let query = supabase
    .from("complaints")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (lockedStatus) {
    query = query.eq("status", lockedStatus);
  } else if (params.status) {
    query = query.eq("status", params.status as ComplaintStatus);
  }
  if (params.category) query = query.eq("category", params.category as ComplaintCategory);
  if (params.area) query = query.ilike("area", `%${params.area}%`);
  if (params.from) query = query.gte("created_at", `${params.from}T00:00:00`);
  if (params.to) query = query.lte("created_at", `${params.to}T23:59:59`);
  if (params.q) query = query.or(`ref_number.ilike.%${params.q}%,phone.ilike.%${params.q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data: complaints, count, error } = await query;

  const hasFilters = Boolean(
    params.status || params.category || params.area || params.from || params.to || params.q
  );

  return (
    <>
      <ComplaintFilters hideStatus={Boolean(lockedStatus)} />

      {error && (
        <div className="rounded-md border border-brick/30 bg-brick/5 text-brick text-sm px-4 py-3 mb-4">
          Couldn&apos;t load complaints: {error.message}
        </div>
      )}

      {!error && (!complaints || complaints.length === 0) && (
        <EmptyState
          title={hasFilters ? "No results for this filter" : emptyTitle}
          description={
            hasFilters ? "Try widening your search or clearing filters." : emptyDescription
          }
        />
      )}

      {complaints && complaints.length > 0 && (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden md:block overflow-x-auto rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-teal-deep text-paper text-left">
                  <th className="px-4 py-3 font-medium">Ref #</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Area</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Photo</th>
                  <th className="px-4 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-paper-raised">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-paper cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/complaints/${c.id}`}
                        className="font-tabular font-medium text-teal-deep hover:underline"
                      >
                        {c.ref_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink">
                      <Link href={`/complaints/${c.id}`} className="block">
                        {categoryLabel(c.category)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone">
                      <Link href={`/complaints/${c.id}`} className="block">
                        {c.area}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone whitespace-nowrap">
                      <Link href={`/complaints/${c.id}`} className="block">
                        {formatWhen(c.created_at)}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/complaints/${c.id}`} className="block">
                        {c.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={c.photo_url}
                            alt=""
                            className="size-10 rounded object-cover border border-border"
                          />
                        ) : (
                          <span className="text-stone/50">—</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/complaints/${c.id}`} className="inline-block">
                        <StatusPill status={c.status} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden space-y-3">
            {complaints.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/complaints/${c.id}`}
                  className="block bg-paper-raised border border-border rounded-md p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <RefStamp refNumber={c.ref_number} size="sm" />
                    <StatusPill status={c.status} />
                  </div>
                  <p className="font-medium text-ink mt-3">{categoryLabel(c.category)}</p>
                  <p className="text-sm text-stone">{c.area}</p>
                  <p className="text-xs text-stone mt-2">{formatWhen(c.created_at)}</p>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={count ?? 0}
            searchParams={params}
            basePath={basePath}
          />
        </>
      )}
    </>
  );
}
