import { Navigate, Outlet, useLocation } from "react-router-dom";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { FullPageLoader } from "@/components/ui/Spinner";
import { profileApi } from "@/api/endpoints";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";

/* ============================================================
   حرّاس المسارات
   ============================================================ */

/** يشترط تسجيل الدخول */
export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}

/** يشترط صلاحية إدارية */
export function RequireAdmin() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

/** يمنع المستخدم المسجّل من فتح صفحات الدخول والتسجيل */
export function GuestOnly() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

/* ============================================================
   التخطيطات
   ============================================================ */

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export function DashboardLayout() {
  const { data } = useApi(() => profileApi.completion(), []);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-8">
        <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
          <DashboardSidebar completionPercent={data?.percent ?? 0} />
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function AdminLayout() {
  return (
    <div className="flex min-h-dvh bg-ink-100">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <footer className="border-t border-ink-200 bg-white px-6 py-4">
          <p className="text-[11.5px] text-ink-400">
            منصة منحتي — لوحة الإدارة الأكاديمية
          </p>
        </footer>
      </div>
    </div>
  );
}
