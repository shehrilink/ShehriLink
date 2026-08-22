import { getCurrentAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateUserForm } from "./CreateUserForm";
import { UserRow } from "./UserRow";

export default async function UsersPage() {
  const admin = await getCurrentAdmin();

  if (!admin || admin.role !== "supervisor") {
    return (
      <div className="max-w-md">
        <h1 className="font-display font-bold text-2xl text-teal-deep mb-6">Users</h1>
        <div className="flex flex-col items-center text-center rounded-md border border-dashed border-border-strong bg-paper-raised px-6 py-16">
          <div className="flex items-center justify-center size-10 rounded-full bg-paper border border-border text-stone mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="size-5">
              <rect x="5" y="11" width="14" height="9" rx="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <p className="font-display font-semibold text-ink">Supervisor access required</p>
          <p className="text-sm text-stone mt-1 max-w-sm">
            Only supervisors can view and create staff accounts. Ask your municipal supervisor
            for access if you need it.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("admin_users")
    .select("*")
    .order("email", { ascending: true });

  return (
    <div className="max-w-3xl">
      <h1 className="font-display font-bold text-2xl text-teal-deep mb-6">Users</h1>

      <section className="bg-paper-raised border border-border rounded-md p-5 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone mb-4">
          Create account
        </h2>
        <CreateUserForm />
      </section>

      <section className="bg-paper-raised border border-border rounded-md overflow-hidden">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone px-5 pt-5 pb-3">
          Staff accounts
        </h2>
        {error && <p className="text-sm text-brick px-5 pb-5">{error.message}</p>}
        {!error && (!users || users.length === 0) && (
          <p className="text-sm text-stone px-5 pb-5">No accounts yet.</p>
        )}
        {users && users.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-stone">
                <th className="px-4 py-2 font-medium">Account</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  email={u.email}
                  fullName={u.full_name}
                  role={u.role}
                  isSelf={u.email === admin.email}
                />
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
