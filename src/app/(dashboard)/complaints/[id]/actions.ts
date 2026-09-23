"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ComplaintStatus } from "@/types/database";

const STATUS_MESSAGES: Record<ComplaintStatus, string> = {
  pending: "Your complaint is pending review.",
  in_progress: "Your complaint is now being worked on.",
  resolved: "Your complaint has been resolved.",
};

export async function updateComplaintStatus(
  complaintId: string,
  oldStatus: ComplaintStatus,
  newStatus: ComplaintStatus
) {
  const supabase = createAdminClient();

  const { data: complaint, error: fetchError } = await supabase
    .from("complaints")
    .select("user_id, ref_number")
    .eq("id", complaintId)
    .maybeSingle();

  if (fetchError || !complaint) {
    return { error: fetchError?.message ?? "Complaint not found." };
  }

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

  // Notify the citizen directly via the notifications table — the mobile app
  // subscribes to this over Supabase Realtime. This replaces the old n8n
  // WhatsApp webhook call entirely.
  const { error: notificationError } = await supabase.from("notifications").insert({
    user_id: complaint.user_id,
    complaint_id: complaintId,
    message: `${complaint.ref_number}: ${STATUS_MESSAGES[newStatus]}`,
  });

  if (notificationError) {
    // Don't fail the status update over a notification hiccup — but surface it.
    console.error("Failed to create notification:", notificationError.message);
  }

  revalidatePath(`/complaints/${complaintId}`);
  revalidatePath("/complaints");
  revalidatePath("/resolved");
  revalidatePath("/");

  return { error: null };
}

export async function deleteComplaint(complaintId: string) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "supervisor") {
    return { error: "Only supervisors can delete complaints." };
  }

  const supabase = createAdminClient();

  // status_history and notifications reference complaints(id) with no
  // ON DELETE CASCADE, so clear the dependent rows first.
  const { error: historyError } = await supabase
    .from("status_history")
    .delete()
    .eq("complaint_id", complaintId);
  if (historyError) return { error: historyError.message };

  const { error: notificationError } = await supabase
    .from("notifications")
    .delete()
    .eq("complaint_id", complaintId);
  if (notificationError) return { error: notificationError.message };

  const { error } = await supabase.from("complaints").delete().eq("id", complaintId);
  if (error) return { error: error.message };

  revalidatePath("/complaints");
  revalidatePath("/resolved");
  revalidatePath("/");
  redirect("/complaints");
}
