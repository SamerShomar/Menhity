"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronLeft, Search } from "lucide-react";

import { ADMIN_NAV } from "@/lib/constants";

/** شريط علوي فيه مسار التنقّل وبحث سريع (Cmd/Ctrl + K) */
export function AdminTopbar() {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const current = ADMIN_NAV.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href),
  );

  const matches = query.trim()
    ? ADMIN_NAV.filter((item) => item.label.includes(query.trim()))
    : [];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-ink-200 bg-white px-6">
      <nav aria-label="مسار التنقّل" className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
        <Link href="/admin" className="hover:text-navy-700">
          لوحة التحكم
        </Link>
        {current && current.href !== "/admin" && (
          <>
            <ChevronLeft className="size-3.5" />
            <span className="font-semibold text-ink-800">{current.label}</span>
          </>
        )}
      </nav>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute inset-y-0 end-3 my-auto size-3.5 text-ink-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setQuery(""), 150)}
            placeholder="بحث سريع (Cmd+K)"
            aria-label="بحث سريع في أقسام لوحة الإدارة"
            className="h-9 w-56 rounded-lg border border-ink-300 bg-ink-50 ps-3 pe-9 text-[12.5px] text-ink-800 placeholder:text-ink-400 focus:border-navy-500 focus:bg-white focus:outline-none"
          />

          {matches.length > 0 && (
            <ul className="absolute end-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-lg">
              {matches.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3 py-2 text-[12.5px] text-ink-600 hover:bg-ink-50 hover:text-navy-700"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Link
          href="/admin/notifications"
          aria-label="الإشعارات"
          className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
        >
          <Bell className="size-4.5" />
        </Link>
      </div>
    </header>
  );
}
