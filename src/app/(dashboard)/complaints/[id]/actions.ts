"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ComplaintStatus } from "@/types/database";

export async function updateComplaintStatus(
  complaintId: string,
  oldStatus: ComplaintStatus,
  newStatus: ComplaintStatus
) {
  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("complaints")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", complaintId);

  if (updateError) {
    return { error: updateError.message };
  }

  const { error: historyError } = await supabase.from("status_history").insert({
    complaint_id: complaintId,
    old_status: oldStatus,
    new_status: newStatus,
  });

  if (historyError) {
    return { error: historyError.message };
  }

  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "n8n_webhook_url")
    .maybeSingle();

  if (setting?.value) {
    try {
      await fetch(setting.value, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint_id: complaintId, status: newStatus }),
      });
    } catch {
      // Notification webhook failure shouldn't block the status update itself.
    }
  }

  revalidatePath(`/complaints/${complaintId}`);
  revalidatePath("/complaints");
  revalidatePath("/");

  return { error: null };
}
