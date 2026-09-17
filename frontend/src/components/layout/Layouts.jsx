import { Navigate, Outlet, useLocation } from "react-router-dom";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { FullPageLoader } from "@/components/ui/Spinner";
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

/**
 * يمنع المستخدم المسجّل من فتح صفحات الدخول والتسجيل.
 *
 * هذا الحارس هو مرجع الوجهة بعد نجاح المصادقة: يُعاد تقييمه فور ضبط
 * المستخدم بينما الصفحة ما زالت صفحة مصادقة، فيسبق أي توجيه داخلها.
 * لذا يحترم next ويميّز المشرف — وإلا هبط المشرف على لوحة الطالب.
 */
export function GuestOnly() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageLoader />;

  if (isAuthenticated) {
    const next = new URLSearchParams(location.search).get("next");

    return <Navigate to={next || (isAdmin ? "/admin" : "/dashboard")} replace />;
  }

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
  /*
   * النسبة تأتي من سياق المصادقة لا من جلبٍ خاص: هذا التخطيط أب للمسارات
   * فلا يُفكّ تركيبه عند التنقّل بينها، وجلبٌ بلا تبعيات كان ينفّذ مرة
   * واحدة فتتجمّد النسبة حتى إعادة تحميل الصفحة كاملة.
   */
  const { user } = useAuth();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main className="container-page flex-1 py-8">
        <div className="grid gap-6 lg:grid-cols-[264px_1fr]">
          <DashboardSidebar completionPercent={user?.completion_percent ?? 0} />
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
    <div className="flex min-h-dvh">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>

        <footer className="glass-soft rounded-none border-x-0 border-b-0 px-6 py-4">
          <p className="text-[11.5px] text-ink-400">
            منصة منحتي — لوحة الإدارة الأكاديمية
          </p>
        </footer>
      </div>
    </div>
  );
}
