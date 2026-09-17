import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";

import { ADMIN_NAV } from "@/lib/constants";

/** شريط علوي بمسار التنقّل وبحث سريع (Cmd/Ctrl + K) */
export function AdminTopbar() {
  const location = useLocation();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const current = ADMIN_NAV.find((item) =>
    item.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.to),
  );

  const matches = query.trim() ? ADMIN_NAV.filter((item) => item.label.includes(query.trim())) : [];

  return (
    <header className="glass-strong sticky top-0 z-30 flex h-16 items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-6 shadow-none">
      <nav aria-label="مسار التنقّل" className="flex items-center gap-1.5 text-[12.5px] text-ink-500">
        <Link to="/admin" className="hover:text-navy-700">
          لوحة التحكم
        </Link>
        {current && current.to !== "/admin" && (
          <>
            <ChevronLeft className="size-3.5" />
            <span className="font-semibold text-ink-800">{current.label}</span>
          </>
        )}
      </nav>

      <div className="relative hidden sm:block">
        <Search className="pointer-events-none absolute inset-y-0 end-3 my-auto size-3.5 text-ink-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onBlur={() => setTimeout(() => setQuery(""), 150)}
          placeholder="بحث سريع (Cmd+K)"
          aria-label="بحث سريع في أقسام لوحة الإدارة"
          className="h-9 w-56 rounded-lg border border-ink-900/12 bg-white/55 backdrop-blur-md ps-3 pe-9 text-[12.5px] text-ink-800 placeholder:text-ink-400 transition-all focus:border-navy-500/60 focus:bg-white/85 focus:outline-none"
        />

        {matches.length > 0 && (
          <ul className="glass-strong absolute end-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-lg py-1">
            {matches.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="block px-3 py-2 text-[12.5px] text-ink-600 hover:bg-white/60 hover:text-navy-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
