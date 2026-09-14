import { Link } from "react-router-dom";

import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

/* ============================================================
   مشاهد SVG — بديل الصور الفوتوغرافية في ملف التصميم
   ============================================================ */

/** طالب متخرّج أمام مبنى جامعي — لوحة جانبية لشاشتَي الدخول والتسجيل */
export function GraduationScene({ className }) {
  return (
    <svg viewBox="0 0 320 300" className={className} role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id="auth-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd25f" />
          <stop offset="100%" stopColor="#e5ac1c" />
        </linearGradient>
      </defs>

      <circle cx="160" cy="150" r="132" fill="#ffffff" opacity="0.06" />
      <circle cx="160" cy="150" r="96" fill="#ffffff" opacity="0.05" />

      {/* قبعة التخرج */}
      <g transform="translate(60 64)">
        <polygon points="100,0 200,42 100,84 0,42" fill="#f8fafc" />
        <path d="M42 58v40c0 12 26 21 58 21s58-9 58-21V58l-58 26z" fill="#cbd3df" />
        <path d="M186 48v58" stroke="url(#auth-gold)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="186" cy="114" r="10" fill="url(#auth-gold)" />
      </g>

      {/* شهادة */}
      <g transform="translate(86 226)">
        <rect width="148" height="24" rx="12" fill="#f8fafc" opacity="0.92" />
        <rect x="54" y="6" width="40" height="12" rx="6" fill="url(#auth-gold)" />
      </g>
    </svg>
  );
}

/** خلفية سماء وغيوم — لشاشات استعادة كلمة المرور */
export function SkyScene({ className }) {
  return (
    <svg viewBox="0 0 1440 700" className={className} preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id="sky-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7f9fdd" />
          <stop offset="55%" stopColor="#4a72c8" />
          <stop offset="100%" stopColor="#14306b" />
        </linearGradient>
      </defs>
      <rect width="1440" height="700" fill="url(#sky-bg)" />
      <g fill="#ffffff" opacity="0.18">
        <ellipse cx="230" cy="180" rx="150" ry="52" />
        <ellipse cx="330" cy="200" rx="110" ry="40" />
        <ellipse cx="1150" cy="130" rx="170" ry="58" />
        <ellipse cx="1030" cy="156" rx="110" ry="38" />
        <ellipse cx="700" cy="560" rx="220" ry="64" />
      </g>
      <g fill="#0b1a3d" opacity="0.25">
        <polygon points="0,700 220,470 430,700" />
        <polygon points="330,700 620,430 900,700" />
        <polygon points="820,700 1120,480 1440,700" />
      </g>
    </svg>
  );
}

/* ============================================================
   الأغلفة
   ============================================================ */

/** عنوان موحّد داخل بطاقة المصادقة */
export function AuthCardHeader({ title, description, icon }) {
  return (
    <div className="mb-6 text-center">
      {icon ? (
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 text-navy-700">
          {icon}
        </div>
      ) : null}
      <h1 className="text-2xl font-bold text-navy-800">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-7 text-ink-500">{description}</p> : null}
    </div>
  );
}

/**
 * شاشة مقسومة: نموذج على جانب ولوحة ترحيب كحلية على الجانب الآخر.
 * تُستخدم في تسجيل الدخول وإنشاء الحساب.
 */
export function AuthSplit({ title, description, badge, children, aside }) {
  return (
    <div className="min-h-dvh bg-ink-100 lg:grid lg:grid-cols-[1fr_minmax(0,520px)]">
      {/* اللوحة الكحلية — تظهر على اليمين في RTL */}
      <aside className="relative hidden overflow-hidden bg-navy-800 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(246,196,69,0.16),transparent_58%)]" />

        <div className="relative flex h-full flex-col p-10 text-white">
          <Logo tone="white" />

          <GraduationScene className="mx-auto my-8 w-full max-w-[260px] shrink" />

          <div className="mt-auto max-w-md">
            {badge ? (
              <span className="mb-4 inline-flex rounded-full bg-gold-400/20 px-4 py-1.5 text-sm font-semibold text-gold-200">
                {badge}
              </span>
            ) : null}
            <h2 className="font-display text-3xl leading-snug">{aside?.title}</h2>
            <p className="mt-4 text-base leading-8 text-navy-100">{aside?.description}</p>
            {aside?.points?.length ? (
              <ul className="mt-6 space-y-3 text-sm text-navy-100">
                {aside.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-400" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <p className="mt-10 text-xs text-navy-200">
            © <span className="num">{new Date().getFullYear()}</span> منحتي — جميع الحقوق محفوظة
          </p>
        </div>
      </aside>

      {/* النموذج */}
      <main className="flex min-h-dvh flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-ink-200 sm:p-8">
            <AuthCardHeader title={title} description={description} />
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-ink-400">
            بمتابعتك أنت توافق على{" "}
            <Link to="/terms" className="font-semibold text-navy-600 hover:underline">
              شروط الاستخدام
            </Link>{" "}
            و
            <Link to="/privacy" className="font-semibold text-navy-600 hover:underline">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

/**
 * بطاقة في منتصف خلفية سماوية — لشاشات استعادة كلمة المرور.
 */
export function AuthCentered({ title, description, icon, children, className, footer = true }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <SkyScene className="absolute inset-0 h-full w-full" />

      <div className="relative flex min-h-dvh flex-col px-4 py-8">
        <div className="mb-auto">
          <Logo tone="white" />
        </div>

        <div className={cn("mx-auto w-full max-w-md", className)}>
          <div className="rounded-3xl bg-white/95 p-6 shadow-xl ring-1 ring-white/40 backdrop-blur sm:p-8">
            <AuthCardHeader title={title} description={description} icon={icon} />
            {children}
          </div>
        </div>

        <div className="mt-auto pt-8 text-center text-xs text-white/80">
          {footer ? (
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link to="/privacy" className="hover:text-white hover:underline">
                سياسة الخصوصية
              </Link>
              <Link to="/terms" className="hover:text-white hover:underline">
                شروط الاستخدام
              </Link>
              <Link to="/contact" className="hover:text-white hover:underline">
                تواصل معنا
              </Link>
            </div>
          ) : null}
          <p className="mt-3">
            © <span className="num">{new Date().getFullYear()}</span> منحتي
          </p>
        </div>
      </div>
    </div>
  );
}
