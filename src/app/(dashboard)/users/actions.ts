"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminRole } from "@/types/database";

async function requireSupervisor() {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "supervisor") {
    throw new Error("Only supervisors can manage users.");
  }
  return admin;
}

export async function createUser(
  _prevState: { error: string | null; ok: boolean },
  formData: FormData
) {
  try {
    await requireSupervisor();
  } catch (e) {
    return { error: (e as Error).message, ok: false };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const role = String(formData.get("role") ?? "staff") as AdminRole;

  if (!email || password.length < 8) {
    return { error: "Email and an 8+ character password are required.", ok: false };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message, ok: false };
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the account.", ok: false };
  }

  const { error: profileError } = await adminClient
    .from("admin_users")
    .insert({ email, full_name: fullName || null, role });

  if (profileError) {
    return { error: profileError.message, ok: false };
  }

  revalidatePath("/users");
  return { error: null, ok: true };
}

export async function updateUserRole(email: string, role: AdminRole) {
  try {
    await requireSupervisor();
  } catch (e) {
    return { error: (e as Error).message };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await adminClient.from("admin_users").update({ role }).eq("email", email);
  if (error) return { error: error.message };

  revalidatePath("/users");
  return { error: null };
}

export async function removeUser(email: string) {
  let supervisor;
  try {
    supervisor = await requireSupervisor();
  } catch (e) {
    return { error: (e as Error).message };
  }

  if (supervisor.email === email) {
    return { error: "You can't remove your own account." };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: profile } = await adminClient
    .from("admin_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const { data: userList } = await adminClient.auth.admin.listUsers();
  const authUser = userList?.users.find((u) => u.email === email);
  if (authUser) {
    await adminClient.auth.admin.deleteUser(authUser.id);
  }

  if (profile) {
    await adminClient.from("admin_users").delete().eq("email", email);
  }

  revalidatePath("/users");
  return { error: null };
}
