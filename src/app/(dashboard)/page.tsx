import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/StatCard";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { StatusPill } from "@/components/StatusPill";
import { EmptyState } from "@/components/EmptyState";
import { categoryLabel } from "@/lib/labels";
import { formatWhen } from "@/lib/format";
import { COMPLAINT_CATEGORIES } from "@/types/database";

export default async function DashboardHomePage() {
  const supabase = await createClient();

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: total },
    { count: pending },
    { count: inProgress },
    { count: resolved },
    { count: resolvedThisWeek },
    { data: recentCategories },
    { data: recentActivity, error: activityError },
  ] = await Promise.all([
    supabase.from("complaints").select("*", { count: "exact", head: true }),
    supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_progress"),
    supabase.from("complaints").select("*", { count: "exact", head: true }).eq("status", "resolved"),
    supabase
      .from("complaints")
      .select("*", { count: "exact", head: true })
      .eq("status", "resolved")
      .gte("updated_at", weekAgo),
    supabase.from("complaints").select("category").gte("created_at", thirtyDaysAgo),
    supabase
      .from("status_history")
      .select("*")
      .order("changed_at", { ascending: false })
      .limit(10),
  ]);

  const activityComplaintIds = [...new Set((recentActivity ?? []).map((e) => e.complaint_id))];
  const { data: activityComplaints } = activityComplaintIds.length
    ? await supabase
        .from("complaints")
        .select("id, ref_number, category")
        .in("id", activityComplaintIds)
    : { data: [] };
  const complaintById = new Map((activityComplaints ?? []).map((c) => [c.id, c]));

  const categoryCounts = COMPLAINT_CATEGORIES.map((c) => ({
    label: c.label,
    count: (recentCategories ?? []).filter((r) => r.category === c.value).length,
  }));

  const hasData = (total ?? 0) > 0;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-teal-deep mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" value={total ?? 0} />
        <StatCard label="Pending" value={pending ?? 0} accent="amber" />
        <StatCard label="In Progress" value={inProgress ?? 0} accent="teal" />
        <StatCard label="Resolved" value={resolved ?? 0} accent="green" />
        <StatCard label="Resolved this week" value={resolvedThisWeek ?? 0} accent="green" />
      </div>

      {!hasData ? (
        <EmptyState
          title="No complaints yet"
          description="Once citizens report issues over WhatsApp, activity will show up here."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-paper-raised border border-border rounded-md p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-4">
              Complaints by Category — Last 30 Days
            </h2>
            <CategoryBarChart data={categoryCounts} />
          </section>

          <section className="bg-paper-raised border border-border rounded-md p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-4">
              Recent Activity
            </h2>
            {activityError && (
              <p className="text-sm text-brick">Couldn&apos;t load activity: {activityError.message}</p>
            )}
            {!activityError && (!recentActivity || recentActivity.length === 0) && (
              <p className="text-sm text-stone">No status changes yet.</p>
            )}
            <ul className="divide-y divide-border">
              {(recentActivity ?? []).map((entry) => {
                const complaint = complaintById.get(entry.complaint_id) ?? null;
                return (
                  <li key={entry.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/complaints/${entry.complaint_id}`}
                      className="flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-ink font-medium truncate">
                          {complaint ? categoryLabel(complaint.category) : "Complaint"}{" "}
                          <span className="text-stone font-normal font-tabular">
                            {complaint?.ref_number}
                          </span>
                        </p>
                        <p className="text-xs text-stone mt-0.5">{formatWhen(entry.changed_at)}</p>
                      </div>
                      <StatusPill status={entry.new_status} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
