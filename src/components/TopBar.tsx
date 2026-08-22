import Image from "next/image";
import { signOut } from "@/app/login/actions";

export function TopBar({ email }: { email: string | null }) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-paper-raised px-4 py-3 md:px-8">
      <div className="flex items-center gap-2 font-display font-semibold text-teal-deep tracking-tight md:hidden">
        <Image src="/logo.png" alt="" width={24} height={24} className="rounded-sm" />
        ShehriLink
      </div>
      <div className="hidden md:block text-sm text-stone">Municipal Complaint Ledger</div>
      <div className="flex items-center gap-3">
        {email && <span className="text-sm text-stone hidden sm:inline">{email}</span>}
        {email && (
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-medium text-teal-mid hover:text-teal-deep transition-colors"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
