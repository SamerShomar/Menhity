"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LayoutGrid, LogOut, Settings, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function UserMenu({
  name,
  avatarUrl,
  isAdmin,
}: {
  name: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const firstName = name.trim().split(/\s+/)[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full py-1 ps-1 pe-2 transition-colors hover:bg-ink-100"
      >
        <Avatar name={name} src={avatarUrl} size={34} />
        <span className="hidden text-[13px] font-semibold text-ink-700 sm:inline">{firstName}</span>
        <ChevronDown
          className={cn("size-3.5 text-ink-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white py-1.5 shadow-[0_16px_40px_-16px_rgb(15_23_42/0.25)]"
        >
          <div className="border-b border-ink-100 px-3.5 pb-2.5 pt-1">
            <p className="truncate text-[13px] font-bold text-ink-900">{name}</p>
          </div>

          <MenuLink href="/dashboard" icon={<LayoutGrid className="size-4" />}>
            لوحتي
          </MenuLink>
          <MenuLink href="/dashboard/profile" icon={<UserRound className="size-4" />}>
            الملف الأكاديمي
          </MenuLink>
          <MenuLink href="/dashboard/settings" icon={<Settings className="size-4" />}>
            الإعدادات
          </MenuLink>
          {isAdmin && (
            <MenuLink href="/admin" icon={<LayoutGrid className="size-4" />}>
              لوحة التحكم الإدارية
            </MenuLink>
          )}

          <form action="/api/auth/logout" method="post" className="mt-1 border-t border-ink-100 pt-1">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-start text-[13px] font-semibold text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut className="size-4" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-100"
    >
      <span className="text-ink-400">{icon}</span>
      {children}
    </Link>
  );
}
