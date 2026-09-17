import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";

import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import { ADMIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="glass hidden w-64 shrink-0 flex-col rounded-none border-y-0 border-s-0 lg:flex">
      <div className="border-b border-ink-900/8 p-5">
        <Logo to="/admin" />

        <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-navy-500/10 px-2 py-1 text-[11px] font-bold text-navy-700">
          <ShieldCheck className="size-3" />
          لوحة تحكم إدارية
        </span>

        <div className="glass-soft mt-3 flex items-center justify-between rounded-lg px-2.5 py-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-600">
            <span className="size-1.5 rounded-full bg-[color:var(--color-success)]" />
            النظام نشط ومستقر
          </span>
          <span className="num text-[11px] font-bold text-[color:var(--color-success)]">99.9%</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
                isActive ? "glass-gold text-navy-900" : "text-ink-600 hover:bg-white/60 hover:text-ink-900",
              )
            }
          >
            <Icon name={item.icon} className="size-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-ink-900/8 p-3">
        <div className="glass-soft rounded-xl p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-navy-700 text-[12px] font-bold text-white">
              {user?.name?.trim().charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-ink-900">{user?.name}</p>
              <p className="truncate text-[11px] text-ink-500">{user?.role_label}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-[12.5px] font-semibold text-[color:var(--color-danger)] transition-colors hover:bg-[color:var(--color-danger)]/12"
          >
            <LogOut className="size-3.5" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </aside>
  );
}
