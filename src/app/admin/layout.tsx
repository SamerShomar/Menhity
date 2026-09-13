import { requireRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/admin/topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN", "MODERATOR");

  return (
    <div className="flex min-h-dvh bg-ink-100">
      <AdminSidebar name={user.fullName} role={user.role} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 p-6">{children}</main>

        <footer className="border-t border-ink-200 bg-white px-6 py-4">
          <p className="text-[11.5px] text-ink-400">
            منصة منحتي — لوحة الإدارة الأكاديمية · آخر تحديث للبيانات{" "}
            <span className="num">
              {new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
