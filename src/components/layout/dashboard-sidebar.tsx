"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { DASHBOARD_NAV, DASHBOARD_NAV_FOOTER } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function DashboardSidebar({
  name,
  avatarUrl,
  completionPercent,
}: {
  name: string;
  avatarUrl: string | null;
  completionPercent: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="lg:sticky lg:top-20 lg:h-fit">
      <div className="rounded-2xl border border-ink-200 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.04)]">
        {/* --- بطاقة المستخدم --- */}
        <div className="flex flex-col items-center border-b border-ink-100 pb-5 text-center">
          <Avatar name={name} src={avatarUrl} size={72} />
          <p className="mt-3 text-[15px] font-bold text-ink-900">{name}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">
            مكتمل بنسبة <span className="num font-semibold">{completionPercent}%</span>
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-3 w-full rounded-lg bg-navy-700 px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-navy-800"
          >
            تحديث الملف
          </Link>
        </div>

        {/* --- التنقّل --- */}
        <nav className="mt-4 flex flex-col gap-0.5">
          {DASHBOARD_NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

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

        {/* --- أسفل السايدبار --- */}
        <div className="mt-5 flex flex-col gap-0.5 border-t border-ink-100 pt-4">
          {DASHBOARD_NAV_FOOTER.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </Link>
          ))}

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-[13.5px] font-medium text-danger transition-colors hover:bg-danger-soft"
            >
              <LogOut className="size-4" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
