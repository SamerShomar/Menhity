"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({
  items,
  className,
}: {
  items: readonly NavItem[];
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("items-center gap-1", className)}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-2 text-[13.5px] font-semibold transition-colors",
              active ? "text-navy-700" : "text-ink-500 hover:text-ink-900",
            )}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-navy-700" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({
  items,
  isAuthed,
}: {
  items: readonly NavItem[];
  isAuthed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="فتح القائمة"
        className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 end-0 flex w-72 max-w-[85vw] flex-col bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display font-bold text-navy-800">القائمة</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="إغلاق القائمة"
                className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                    isActive(pathname, item.href)
                      ? "bg-navy-50 text-navy-700"
                      : "text-ink-600 hover:bg-ink-100",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {!isAuthed && (
              <div className="mt-auto flex flex-col gap-2 border-t border-ink-200 pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-ink-300 px-3 py-2.5 text-center text-sm font-semibold text-ink-700"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-navy-700 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
