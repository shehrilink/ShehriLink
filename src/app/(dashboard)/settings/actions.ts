"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function saveDailyComplaintLimit(
  _prevState: { error: string | null; ok: boolean },
  formData: FormData
) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "supervisor") {
    return { error: "Only supervisors can change this setting.", ok: false };
  }

  const raw = String(formData.get("daily_limit") ?? "").trim();

  if (raw !== "") {
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return { error: "Enter a whole number of 1 or more, or leave it blank for no limit.", ok: false };
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "daily_complaint_limit", value: raw }, { onConflict: "key" });

  if (error) {
    return { error: error.message, ok: false };
  }

  revalidatePath("/settings");
  return { error: null, ok: true };
}
