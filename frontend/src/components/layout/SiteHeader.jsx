import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { notificationApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // إغلاق قائمة الجوال عند تغيّر المسار
  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return undefined;
    }

    let cancelled = false;

    notificationApi
      .unreadCount()
      .then((count) => {
        if (!cancelled) setUnread(count);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            {PUBLIC_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
                    isActive ? "text-navy-700" : "text-ink-500 hover:text-ink-900",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-navy-700" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard/notifications"
                aria-label={`الإشعارات${unread ? ` (${unread} غير مقروء)` : ""}`}
                className="relative rounded-full p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
              >
                <Bell className="size-5" />
                {unread > 0 && (
                  <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-[color:var(--color-danger)] ring-2 ring-white" />
                )}
              </Link>
              <span className="hidden h-7 w-px bg-ink-200 sm:block" />
              <UserMenu />
            </>
          ) : (
            <>
              <ButtonLink to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                تسجيل الدخول
              </ButtonLink>
              <ButtonLink to="/register" size="sm">
                ابدأ الآن
              </ButtonLink>
            </>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="فتح القائمة"
            className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 md:hidden"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display font-bold text-navy-800">القائمة</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="إغلاق القائمة"
                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {PUBLIC_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                      isActive ? "bg-navy-50 text-navy-700" : "text-ink-600 hover:bg-ink-100",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {!isAuthenticated && (
              <div className="mt-auto flex flex-col gap-2 border-t border-ink-200 pt-4">
                <ButtonLink to="/login" variant="outline" fullWidth>
                  تسجيل الدخول
                </ButtonLink>
                <ButtonLink to="/register" fullWidth>
                  إنشاء حساب
                </ButtonLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
