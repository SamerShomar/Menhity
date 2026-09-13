import { NavLink, useNavigate } from "react-router-dom";
import { CircleHelp, LogOut } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { useAuth } from "@/context/AuthContext";
import { DASHBOARD_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LINK_BASE =
  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors";

export function DashboardSidebar({ completionPercent }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="lg:sticky lg:top-20 lg:h-fit">
      <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
        <div className="flex flex-col items-center border-b border-ink-100 pb-5 text-center">
          <Avatar name={user?.name} src={user?.avatar_url} size={72} />
          <p className="mt-3 text-[15px] font-bold text-ink-900">{user?.name}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">
            مكتمل بنسبة <span className="num font-semibold">{completionPercent ?? 0}%</span>
          </p>
          <NavLink
            to="/dashboard/profile"
            className="mt-3 w-full rounded-lg bg-navy-700 px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-navy-800"
          >
            تحديث الملف
          </NavLink>
        </div>

        <nav className="mt-4 flex flex-col gap-0.5">
          {DASHBOARD_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  LINK_BASE,
                  isActive ? "bg-gold-400 text-navy-900" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                )
              }
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 flex flex-col gap-0.5 border-t border-ink-100 pt-4">
          <NavLink
            to="/help"
            className={cn(LINK_BASE, "font-medium text-ink-500 hover:bg-ink-100 hover:text-ink-800")}
          >
            <CircleHelp className="size-4" />
            مركز المساعدة
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              LINK_BASE,
              "w-full text-start font-medium text-[color:var(--color-danger)] hover:bg-danger-soft",
            )}
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </aside>
  );
}
