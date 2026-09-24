import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { RefStamp } from "@/components/RefStamp";
import { StatusPill } from "@/components/StatusPill";
import { StatusChanger } from "@/components/StatusChanger";
import { PhotoZoom } from "@/components/PhotoZoom";
import { UrgencyPill } from "@/components/UrgencyPill";
import { DeleteComplaintButton } from "@/components/DeleteComplaintButton";
import { getCurrentAdmin } from "@/lib/auth";
import { categoryLabel } from "@/lib/labels";
import { formatWhen } from "@/lib/format";
import { withTriageOne } from "@/lib/ml/triage";
import type { StatusHistory } from "@/types/database";

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: complaint, error } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !complaint) {
    notFound();
  }

  const admin = await getCurrentAdmin();
  const triaged = await withTriageOne(complaint);
  const categoryMismatch =
    triaged.ai_category != null && triaged.ai_category !== triaged.category;

  const { data: history } = await supabase
    .from("status_history")
    .select("*")
    .eq("complaint_id", id)
    .order("changed_at", { ascending: false });

  const { data: citizen } = await supabase
    .from("app_users")
    .select("full_name, cnic")
    .eq("id", complaint.user_id)
    .maybeSingle();

  return (
    <div className="max-w-4xl">
      <Link
        href="/complaints"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-mid hover:text-teal-deep mb-6"
      >
        <span aria-hidden>←</span> Back to complaints
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <RefStamp refNumber={complaint.ref_number} />
          <h1 className="font-display font-bold text-2xl text-teal-deep mt-4">
            {categoryLabel(complaint.category)}
          </h1>
          <p className="text-stone text-sm mt-1">{complaint.area}</p>
        </div>
        <div className="flex items-center gap-2">
          <UrgencyPill
            urgency={triaged.ai_urgency}
            confidence={triaged.ai_urgency_confidence}
          />
          <StatusPill status={complaint.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-paper-raised border border-border rounded-md p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-3">
              Description
            </h2>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
              {complaint.description || "No description provided."}
            </p>
          </section>

          {complaint.photo_url && (
            <section className="bg-paper-raised border border-border rounded-md p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-3">
                Photo
              </h2>
              <PhotoZoom src={complaint.photo_url} alt={`Photo for ${complaint.ref_number}`} />
            </section>
          )}

          <section className="bg-paper-raised border border-border rounded-md p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-4">
              Timeline
            </h2>
            <Timeline history={history ?? []} createdAt={complaint.created_at} />
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-paper-raised border border-border rounded-md p-5">
            <StatusChanger complaintId={complaint.id} status={complaint.status} />
          </section>

          <section className="bg-paper-raised border border-border rounded-md p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone">
              AI Triage
            </h2>
            {triaged.ai_predicted_at == null ? (
              <p className="text-sm text-stone">Not available for this complaint.</p>
            ) : (
              <dl className="text-sm space-y-2">
                <div className="flex justify-between gap-4 items-center">
                  <dt className="text-stone">Urgency</dt>
                  <dd>
                    <UrgencyPill
                      urgency={triaged.ai_urgency}
                      confidence={triaged.ai_urgency_confidence}
                      size="sm"
                    />
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-stone">Suggested category</dt>
                  <dd className="text-ink text-right">
                    {triaged.ai_category ? categoryLabel(triaged.ai_category) : "—"}
                    {triaged.ai_category_confidence != null && (
                      <span className="block text-xs text-stone">
                        {Math.round(triaged.ai_category_confidence * 100)}% confidence
                      </span>
                    )}
                  </dd>
                </div>
                {categoryMismatch && (
                  <p className="text-xs text-amber bg-amber/10 rounded px-2 py-1.5">
                    Citizen filed this as {categoryLabel(triaged.category)}, but the
                    model suggests {categoryLabel(triaged.ai_category!)}.
                  </p>
                )}
                <p className="text-[11px] text-stone/70 pt-1">
                  Predicted automatically from the description. Not a substitute for
                  staff review.
                </p>
              </dl>
            )}
          </section>

          <section className="bg-paper-raised border border-border rounded-md p-5 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone">
              Citizen
            </h2>
            <dl className="text-sm space-y-2">
              <div className="flex justify-between gap-4">
                <dt className="text-stone">Name</dt>
                <dd className="text-ink text-right">{citizen?.full_name ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone">CNIC</dt>
                <dd className="font-tabular text-ink">{citizen?.cnic ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone">Submitted</dt>
                <dd className="text-ink text-right">{formatWhen(complaint.created_at)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-stone">Last updated</dt>
                <dd className="text-ink text-right">{formatWhen(complaint.updated_at)}</dd>
              </div>
            </dl>
          </section>

          {admin?.role === "supervisor" && (
            <section className="bg-paper-raised border border-border rounded-md p-5">
              <DeleteComplaintButton
                complaintId={complaint.id}
                refNumber={complaint.ref_number}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Timeline({ history, createdAt }: { history: StatusHistory[]; createdAt: string }) {
  const entries = [...history].reverse();

  return (
    <ol className="relative border-l border-border pl-5 space-y-5">
      <li className="relative">
        <span className="absolute -left-[26px] top-1 size-2.5 rounded-full bg-stone" />
        <p className="text-sm text-ink font-medium">Complaint submitted</p>
        <p className="text-xs text-stone">{formatWhen(createdAt)}</p>
      </li>
      {entries.map((entry) => (
        <li key={entry.id} className="relative">
          <span
            className={`absolute -left-[26px] top-1 size-2.5 rounded-full ${dotColor(
              entry.new_status
            )}`}
          />
          <p className="text-sm text-ink font-medium">
            Status changed to <StatusPill status={entry.new_status} />
          </p>
          <p className="text-xs text-stone mt-1">{formatWhen(entry.changed_at)}</p>
        </li>
      ))}
      {entries.length === 0 && (
        <li className="relative">
          <span className="absolute -left-[26px] top-1 size-2.5 rounded-full bg-border-strong" />
          <p className="text-sm text-stone">No status changes yet.</p>
        </li>
      )}
    </ol>
  );
}

function dotColor(status: StatusHistory["new_status"]) {
  switch (status) {
    case "pending":
      return "bg-amber";
    case "in_progress":
      return "bg-teal-mid";
    case "resolved":
      return "bg-green";
    default:
      return "bg-stone";
  }
}
