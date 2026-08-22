import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/types/database";

export async function getCurrentAdmin(): Promise<{
  email: string;
  role: AdminRole;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const { data: existing } = await supabase
    .from("admin_users")
    .select("email, role")
    .eq("email", user.email)
    .maybeSingle();

  if (existing) {
    return { email: existing.email, role: existing.role };
  }

  // Bootstrap: the first person to sign in becomes supervisor so someone
  // can actually use the Users page to add everyone else.
  const { count } = await supabase
    .from("admin_users")
    .select("*", { count: "exact", head: true });

  if (!count) {
    await supabase.from("admin_users").insert({ email: user.email, role: "supervisor" });
    return { email: user.email, role: "supervisor" };
  }

  return { email: user.email, role: "staff" };
}
