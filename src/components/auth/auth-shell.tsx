import Link from "next/link";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/ui/logo";
import { SITE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/* ============================================================
   لوحة جانبية مزخرفة — بديل الصور الفوتوغرافية في ملف التصميم
   ============================================================ */

function GraduationScene() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e4a9c" />
          <stop offset="100%" stopColor="#0b1a3d" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky)" />

      {/* قبعات تخرّج متطايرة */}
      {[
        [60, 70, -22], [140, 42, 14], [225, 62, -10],
        [310, 38, 25], [95, 128, 8], [268, 122, -18], [350, 96, -6],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={0.85 - i * 0.05}>
          <path d="M0 6 18 0 36 6 18 12Z" fill="#f6c445" />
          <path d="M6 9v8c0 2.6 5.4 4.6 12 4.6s12-2 12-4.6V9l-12 4z" fill="#ffd25f" />
          <path d="M33 7v11" stroke="#ffd25f" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}

      {/* أفق مبانٍ */}
      <g fill="#0b1a3d" opacity="0.55">
        <rect x="0" y="212" width="46" height="88" />
        <rect x="52" y="236" width="38" height="64" />
        <rect x="96" y="198" width="54" height="102" />
        <rect x="156" y="228" width="42" height="72" />
        <rect x="204" y="206" width="50" height="94" />
        <rect x="260" y="240" width="36" height="60" />
        <rect x="302" y="214" width="48" height="86" />
        <rect x="356" y="232" width="44" height="68" />
      </g>
    </svg>
  );
}

function SkyScene() {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b52ab" />
          <stop offset="60%" stopColor="#4a72c8" />
          <stop offset="100%" stopColor="#7f9fdd" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky2)" />

      {/* غيوم */}
      <g fill="#ffffff" opacity="0.18">
        <ellipse cx="70" cy="230" rx="90" ry="34" />
        <ellipse cx="180" cy="252" rx="120" ry="40" />
        <ellipse cx="330" cy="236" rx="100" ry="32" />
        <ellipse cx="120" cy="70" rx="52" ry="18" />
        <ellipse cx="300" cy="48" rx="64" ry="20" />
      </g>

      {/* طائرة */}
      <g transform="translate(200 140) rotate(-12)">
        <path d="M-70 0 40 -8 62 0 40 8Z" fill="#ffffff" opacity="0.95" />
        <path d="M-14 -4-34-34-16-34 8-6Z" fill="#eef3fb" opacity="0.9" />
        <path d="M-14 4-34 34-16 34 8 6Z" fill="#d8e3f6" opacity="0.9" />
        <path d="M-70 0-86-10-70-3Z" fill="#ffffff" opacity="0.8" />
      </g>
      <path
        d="M-10 150 C 60 138, 120 150, 180 142"
        stroke="#ffffff"
        strokeOpacity="0.25"
        strokeWidth="3"
        strokeDasharray="8 10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* ============================================================
   تخطيط شاشتَي الدخول والتسجيل (لوحة جانبية + نموذج)
   ============================================================ */

export function AuthSplit({
  children,
  panelBadge,
  panelTitle,
  panelText,
  panelSide = "start",
  scene = "graduation",
}: {
  children: ReactNode;
  panelBadge: string;
  panelTitle: ReactNode;
  panelText: string;
  /** أي جهة تظهر فيها اللوحة المزخرفة */
  panelSide?: "start" | "end";
  scene?: "graduation" | "sky";
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* --- اللوحة المزخرفة --- */}
      <div
        className={cn(
          "relative hidden overflow-hidden bg-navy-800 lg:block",
          panelSide === "end" && "lg:order-2",
        )}
      >
        <div className="absolute inset-0">
          {scene === "sky" ? <SkyScene /> : <GraduationScene />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/70 via-navy-900/35 to-navy-900/70" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
              {panelBadge}
            </span>
            <h2 className="mt-6 max-w-sm font-display text-3xl font-extrabold leading-snug text-white">
              {panelTitle}
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-navy-100">{panelText}</p>
          </div>

          <p className="text-[13px] font-medium text-white/70">{SITE.tagline}</p>
        </div>
      </div>

      {/* --- النموذج --- */}
      <div className="flex items-center justify-center bg-ink-100 px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}

/* ============================================================
   تخطيط شاشات استعادة كلمة المرور (بطاقة في المنتصف)
   ============================================================ */

export function AuthCentered({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <SkyScene />
        <div className="absolute inset-0 bg-white/55 backdrop-blur-[2px]" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px] rounded-2xl border border-white/70 bg-white/95 p-7 shadow-[0_24px_60px_-24px_rgb(11_26_61/0.35)] sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <LogoMark className="size-10" />
          </div>
          {children}
        </div>
      </div>

      <footer className="pb-6">
        <nav className="flex items-center justify-center gap-5 text-[12px] font-medium text-navy-800/70">
          <Link href="/privacy" className="hover:text-navy-900">
            سياسة الخصوصية
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/terms" className="hover:text-navy-900">
            شروط الاستخدام
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/contact" className="hover:text-navy-900">
            تواصل معنا
          </Link>
        </nav>
      </footer>
    </div>
  );
}
