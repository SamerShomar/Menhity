"use client";

import { useState } from "react";

/**
 * تسجيل الدخول بمزوّد خارجي.
 * التكامل الفعلي مع Google/Apple يتطلّب بيانات اعتماد OAuth،
 * لذا تعرض الأزرار رسالة توضيحية حتى تُضاف المفاتيح.
 */
export function SocialButtons() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setNotice("تسجيل الدخول عبر Google غير مفعّل بعد — يحتاج إضافة بيانات اعتماد OAuth.")}
          className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-ink-300 bg-white text-sm font-semibold text-ink-700 transition-colors hover:border-ink-400 hover:bg-ink-50"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
            <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.3 1.1-4 1.1-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
            <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
            <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
          </svg>
          Google
        </button>

        <button
          type="button"
          onClick={() => setNotice("تسجيل الدخول عبر Apple غير مفعّل بعد — يحتاج إضافة بيانات اعتماد OAuth.")}
          className="flex h-11 items-center justify-center gap-2 rounded-[10px] border border-ink-300 bg-white text-sm font-semibold text-ink-700 transition-colors hover:border-ink-400 hover:bg-ink-50"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
            <path d="M17.05 12.5c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.9c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1.1 2.8-2.2c.9-1.2 1.2-2.4 1.3-2.5 0 0-2.5-1-2.5-3.5zM14.8 4.9c.6-.8 1.1-1.9 1-3-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.6 2.9-1.4z" />
          </svg>
          Apple
        </button>
      </div>

      {notice && (
        <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-center text-[12px] text-[#78350f]">
          {notice}
        </p>
      )}
    </div>
  );
}
