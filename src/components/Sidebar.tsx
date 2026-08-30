"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import type { AdminRole } from "@/types/database";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: DashboardIcon, adminOnly: false },
  { href: "/complaints", label: "Complaints", icon: ComplaintsIcon, adminOnly: false },
  { href: "/resolved", label: "Resolved", icon: ResolvedIcon, adminOnly: false },
  { href: "/users", label: "Users", icon: UsersIcon, adminOnly: true },
  { href: "/settings", label: "Settings", icon: SettingsIcon, adminOnly: true },
];

export function Sidebar({ role }: { role: AdminRole | null }) {
  const pathname = usePathname();
  const isAdmin = role === "supervisor";

  return (
    <>
      <nav className="hidden md:flex md:flex-col md:w-56 lg:w-64 shrink-0 border-r border-border bg-teal-deep text-paper min-h-screen sticky top-0">
        <div className="flex items-center gap-2.5 px-5 py-6 border-b border-white/10">
          <Image src="/logo.png" alt="" width={32} height={32} className="rounded-sm" />
          <span className="font-display font-bold text-lg tracking-tight">ShehriLink</span>
        </div>
        <ul className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const locked = item.adminOnly && !isAdmin;
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/10 text-white"
                      : "text-paper/70 hover:bg-white/5 hover:text-paper"
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {locked && <LockIcon className="size-3.5 shrink-0 text-paper/40" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-teal-deep text-paper flex">
        {NAV_ITEMS.map((item) => {
          const locked = item.adminOnly && !isAdmin;
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "relative flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-medium",
                active ? "text-white" : "text-paper/60"
              )}
            >
              <item.icon className="size-5" />
              {item.label}
              {locked && (
                <LockIcon className="absolute top-1.5 right-[calc(50%-18px)] size-3 text-paper/50" />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="5" rx="1" />
      <rect x="13" y="10" width="8" height="11" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function ComplaintsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1.4.92L12 19l-3.6 1.92A1 1 0 0 1 7 20V4a1 1 0 0 1 1-1Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

function ResolvedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 4.5a3 3 0 0 1 0 5.9" />
      <path d="M18.5 14c2 .5 3.5 2.5 3.5 6" />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
