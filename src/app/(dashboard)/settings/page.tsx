import { getCurrentAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { DailyLimitForm } from "./DailyLimitForm";

export default async function SettingsPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "supervisor") {
    return (
      <div className="max-w-md">
        <h1 className="font-display font-bold text-2xl text-teal-deep mb-6">Settings</h1>
        <div className="flex flex-col items-center text-center rounded-md border border-dashed border-border-strong bg-paper-raised px-6 py-16">
          <div className="flex items-center justify-center size-10 rounded-full bg-paper border border-border text-stone mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5">
              <rect x="5" y="11" width="14" height="9" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <p className="font-display font-semibold text-ink">Supervisor access required</p>
          <p className="text-sm text-stone mt-1 max-w-sm">
            Only supervisors can change app-wide settings.
          </p>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "daily_complaint_limit")
    .maybeSingle();

  return (
    <div className="max-w-xl">
      <h1 className="font-display font-bold text-2xl text-teal-deep mb-6">Settings</h1>

      <section className="bg-paper-raised border border-border rounded-md p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-4">
          Complaint Limits
        </h2>
        <DailyLimitForm initialValue={data?.value ?? ""} />
      </section>
    </div>
  );
}
