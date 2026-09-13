import { requireUser } from "@/lib/auth";
import { refreshCompletion } from "@/lib/student-data";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const completionPercent = await refreshCompletion(user.id);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-8">
        <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
          <DashboardSidebar
            name={user.fullName}
            avatarUrl={user.avatarUrl}
            completionPercent={completionPercent}
          />
          <div className="min-w-0">{children}</div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
