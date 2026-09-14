import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LayoutGrid, LogOut, Settings, UserRound } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function onClick(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }

    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  async function handleLogout() {
    setOpen(false);
    await logout();
    navigate("/login");
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1 ps-1 pe-2 transition-colors hover:bg-ink-100"
      >
        <Avatar name={user.name} src={user.avatar_url} size={34} />
        <span className="hidden text-[13px] font-semibold text-ink-700 sm:inline">{user.first_name}</span>
        <ChevronDown className={cn("size-3.5 text-ink-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-[0_16px_40px_-16px_rgb(15_23_42/0.25)]"
        >
          <div className="border-b border-ink-100 px-3.5 pb-2.5 pt-1">
            <p className="truncate text-[13px] font-bold text-ink-900">{user.name}</p>
          </div>

          <MenuLink to="/dashboard" onClick={() => setOpen(false)} icon={<LayoutGrid className="size-4" />}>
            لوحتي
          </MenuLink>
          <MenuLink to="/dashboard/profile" onClick={() => setOpen(false)} icon={<UserRound className="size-4" />}>
            الملف الأكاديمي
          </MenuLink>
          <MenuLink to="/dashboard/settings" onClick={() => setOpen(false)} icon={<Settings className="size-4" />}>
            الإعدادات
          </MenuLink>
          {isAdmin && (
            <MenuLink to="/admin" onClick={() => setOpen(false)} icon={<LayoutGrid className="size-4" />}>
              لوحة التحكم الإدارية
            </MenuLink>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2.5 border-t border-ink-100 px-3.5 py-2 pt-2.5 text-start text-[13px] font-semibold text-[color:var(--color-danger)] transition-colors hover:bg-danger-soft"
          >
            <LogOut className="size-4" />
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, icon, onClick, children }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-100"
    >
      <span className="text-ink-400">{icon}</span>
      {children}
    </Link>
  );
}
