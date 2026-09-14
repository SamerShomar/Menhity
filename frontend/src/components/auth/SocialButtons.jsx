import { useState } from "react";

/**
 * أزرار الدخول عبر مزوّدي الهوية.
 * لا يوجد OAuth مُهيّأ في هذه النسخة، فتُظهر الأزرار تنبيهاً واضحاً
 * بدل أن تقود المستخدم إلى صفحة معطّلة.
 */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.45a5.5 5.5 0 0 1-2.39 3.62v3h3.86c2.26-2.08 3.58-5.15 3.58-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.91l-3.86-3c-1.08.72-2.45 1.15-4.08 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09Z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M16.37 12.72c.02-2.17 1.77-3.21 1.85-3.26-1.01-1.48-2.58-1.68-3.14-1.7-1.34-.13-2.61.79-3.29.79-.68 0-1.72-.77-2.83-.75-1.46.02-2.8.85-3.55 2.16-1.51 2.63-.39 6.51 1.09 8.64.72 1.04 1.58 2.21 2.71 2.17 1.09-.04 1.5-.7 2.82-.7s1.69.7 2.83.68c1.17-.02 1.91-1.06 2.63-2.11.83-1.21 1.17-2.38 1.19-2.44-.03-.01-2.28-.88-2.31-3.48ZM14.2 5.36c.6-.73 1-1.74.89-2.75-.86.04-1.9.57-2.52 1.29-.55.64-1.04 1.67-.91 2.65.96.08 1.94-.49 2.54-1.19Z" />
    </svg>
  );
}

export function SocialButtons({ label = "أو تابع باستخدام" }) {
  const [notice, setNotice] = useState(false);

  const buttonClass =
    "flex flex-1 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-navy-300 hover:bg-ink-50";

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-200" />
        <span>{label}</span>
        <span className="h-px flex-1 bg-ink-200" />
      </div>

      <div className="mt-4 flex gap-3">
        <button type="button" className={buttonClass} onClick={() => setNotice(true)}>
          <GoogleIcon />
          جوجل
        </button>
        <button type="button" className={buttonClass} onClick={() => setNotice(true)}>
          <AppleIcon />
          آبل
        </button>
      </div>

      {notice ? (
        <p className="mt-3 rounded-xl bg-gold-50 px-3 py-2 text-center text-xs leading-6 text-gold-800">
          الدخول عبر جوجل وآبل غير مُفعّل بعد في هذه النسخة. استخدم البريد الإلكتروني وكلمة المرور.
        </p>
      ) : null}
    </div>
  );
}
