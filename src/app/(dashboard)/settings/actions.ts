"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveWebhookUrl(_prevState: { error: string | null; ok: boolean }, formData: FormData) {
  const value = String(formData.get("webhook_url") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "n8n_webhook_url", value }, { onConflict: "key" });

  if (error) {
    return { error: error.message, ok: false };
  }

  revalidatePath("/settings");
  return { error: null, ok: true };
}
