import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { getCurrentAdmin } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar role={admin?.role ?? null} />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar email={admin?.email ?? null} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
