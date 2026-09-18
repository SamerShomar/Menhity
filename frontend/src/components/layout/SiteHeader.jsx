import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, Menu, X } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { notificationApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useHeaderOverDark } from "@/hooks/useHeaderOverDark";
import { PUBLIC_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { isAuthenticated } = useAuth();
  const [unread, setUnread] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  /*
   * النصّ يقلب إلى الأبيض فوق الأسطح الداكنة: الترويسة زجاج شديد الشفافية،
   * ولون ما خلفها هو خلفية نصّها فعلياً.
   */
  const overDark = useHeaderOverDark();

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
    <>
      <header
        data-over-dark={overDark || undefined}
        className={cn(
          "sticky top-0 z-40 rounded-none border-x-0 border-t-0",
          overDark ? "glass-header-dark" : "glass-header",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo tone={overDark ? "white" : "navy"} />

            <nav className="hidden items-center gap-1 md:flex">
              {PUBLIC_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "relative rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
                      overDark
                        ? isActive
                          ? "text-white"
                          : "text-white/85 hover:text-white"
                        : isActive
                          ? "text-navy-900"
                          : "text-ink-800 hover:text-navy-900",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span
                          className={cn(
                            "absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full",
                            overDark ? "bg-gold-400" : "bg-navy-900",
                          )}
                        />
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
                  className={cn(
                  "relative rounded-full p-2 transition-colors",
                  overDark
                    ? "text-white/85 hover:bg-white/15 hover:text-white"
                    : "text-ink-700 hover:bg-white/60 hover:text-navy-900",
                )}
                >
                  <Bell className="size-5" />
                  {unread > 0 && (
                    <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-[color:var(--color-danger)] ring-2 ring-white" />
                  )}
                </Link>
                <span
                className={cn(
                  "hidden h-7 w-px sm:block",
                  overDark ? "bg-white/25" : "bg-ink-900/20",
                )}
              />
                <UserMenu overDark={overDark} />
              </>
            ) : (
              <>
                <ButtonLink
                  to="/login"
                  variant="ghost"
                  size="sm"
                  className={cn(
                  "hidden sm:inline-flex",
                  overDark ? "text-white hover:bg-white/15 hover:text-white" : "text-ink-800",
                )}
                >
                  تسجيل الدخول
                </ButtonLink>
                {/* الفعل الأساسي كحلي، ويذوب في الشريط الكحلي فيصير ذهبياً فوقه */}
                <ButtonLink to="/register" size="sm" variant={overDark ? "gold" : "primary"}>
                  ابدأ الآن
                </ButtonLink>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="فتح القائمة"
              className={cn(
              "rounded-lg p-2 transition-colors md:hidden",
              overDark
                ? "text-white hover:bg-white/15"
                : "text-ink-800 hover:bg-white/60",
            )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/*
       * الدرج خارج الترويسة عمداً: عنصر فيه backdrop-filter يصير المرجع
       * لكل fixed بداخله، فلو بقي الدرج داخلها انحصر في شريطها بدل الشاشة.
       */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="glass-strong absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col rounded-none border-y-0 border-e-0 p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display font-bold text-navy-800">القائمة</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="إغلاق القائمة"
                className="rounded-lg p-1.5 text-ink-500 hover:bg-white/60"
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
                      isActive ? "bg-navy-500/12 text-navy-700" : "text-ink-600 hover:bg-white/60",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {!isAuthenticated && (
              <div className="mt-auto flex flex-col gap-2 border-t border-ink-900/10 pt-4">
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
    </>
  );
}
