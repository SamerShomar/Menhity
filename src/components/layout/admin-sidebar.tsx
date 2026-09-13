"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { ADMIN_NAV, USER_ROLE_LABELS } from "@/lib/constants";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import type { UserRole } from "@prisma/client";

export function AdminSidebar({ name, role }: { name: string; role: UserRole }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-e border-ink-200 bg-white">
      {/* --- الترويسة --- */}
      <div className="border-b border-ink-100 p-5">
        <Logo href="/admin" />
        <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-navy-50 px-2 py-1 text-[11px] font-bold text-navy-700">
          <ShieldCheck className="size-3" />
          لوحة تحكم إدارية
        </span>

        {/* مؤشر حالة النظام */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-ink-50 px-2.5 py-1.5">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-600">
            <span className="size-1.5 rounded-full bg-[color:var(--color-success)]" />
            النظام نشط ومستقر
          </span>
          <span className="num text-[11px] font-bold text-[color:var(--color-success)]">99.9%</span>
        </div>
      </div>

      {/* --- التنقّل --- */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {ADMIN_NAV.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
                active
                  ? "bg-gold-400 text-navy-900"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* --- حساب الأدمن --- */}
      <div className="border-t border-ink-100 p-3">
        <div className="rounded-xl bg-ink-50 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-navy-700 text-[12px] font-bold text-white">
              {name.trim().charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-ink-900">{name}</p>
              <p className="truncate text-[11px] text-ink-500">{USER_ROLE_LABELS[role]}</p>
            </div>
          </div>

          <form action="/api/auth/logout" method="post" className="mt-2.5">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-[12.5px] font-semibold text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut className="size-3.5" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
