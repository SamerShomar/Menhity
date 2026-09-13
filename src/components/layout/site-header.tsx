import Link from "next/link";
import { Bell } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PUBLIC_NAV } from "@/lib/constants";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import { NavLinks, MobileNav } from "@/components/layout/nav-links";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const unreadCount = user
    ? await prisma.notification.count({ where: { userId: user.id, readAt: null } })
    : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Logo />
          <NavLinks items={PUBLIC_NAV} className="hidden md:flex" />
        </div>

        <div className="flex items-center gap-2.5">
          {user ? (
            <>
              <Link
                href="/dashboard/notifications"
                aria-label={`الإشعارات${unreadCount ? ` (${unreadCount} غير مقروء)` : ""}`}
                className="relative rounded-full p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
              >
                <Bell className="size-5" />
                {unreadCount > 0 && (
                  <span className="absolute end-1.5 top-1.5 size-2 rounded-full bg-danger ring-2 ring-white" />
                )}
              </Link>
              <span className="hidden h-7 w-px bg-ink-200 sm:block" />
              <UserMenu
                name={user.fullName}
                avatarUrl={user.avatarUrl}
                isAdmin={user.role === "ADMIN" || user.role === "MODERATOR"}
              />
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                تسجيل الدخول
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                ابدأ الآن
              </ButtonLink>
            </>
          )}
          <MobileNav items={PUBLIC_NAV} isAuthed={Boolean(user)} />
        </div>
      </div>
    </header>
  );
}
