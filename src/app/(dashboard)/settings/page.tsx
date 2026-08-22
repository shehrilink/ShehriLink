import { createClient } from "@/lib/supabase/server";
import { WebhookForm } from "./WebhookForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "n8n_webhook_url")
    .maybeSingle();

  return (
    <div className="max-w-xl">
      <h1 className="font-display font-bold text-2xl text-teal-deep mb-6">Settings</h1>

      <section className="bg-paper-raised border border-border rounded-md p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-4">
          Notifications
        </h2>
        <WebhookForm initialValue={data?.value ?? ""} />
      </section>
    </div>
  );
}
