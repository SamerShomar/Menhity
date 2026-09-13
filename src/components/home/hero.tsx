import { ArrowLeft, PlayCircle, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

/** خلفية الهيرو — مشهد تخرّج مرسوم بدل الصورة الفوتوغرافية */
function HeroBackdrop() {
  return (
    <svg
      viewBox="0 0 1200 600"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3f8c" />
          <stop offset="55%" stopColor="#14306b" />
          <stop offset="100%" stopColor="#0b1a3d" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#4a72c8" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#4a72c8" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="600" fill="url(#heroSky)" />
      <rect width="1200" height="600" fill="url(#glow)" />

      {/* قبعات تخرّج متطايرة */}
      {[
        [120, 90, -18, 1], [300, 60, 12, 0.85], [480, 110, -6, 0.7],
        [700, 70, 20, 0.9], [880, 120, -14, 0.75], [1060, 80, 8, 0.85],
        [210, 190, 24, 0.5], [620, 200, -20, 0.45], [980, 210, 10, 0.5],
      ].map(([x, y, r, o], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={o as number}>
          <path d="M0 8 24 0 48 8 24 16Z" fill="#f6c445" />
          <path d="M8 12v10c0 3.4 7.2 6 16 6s16-2.6 16-6V12l-16 5.4z" fill="#ffd25f" />
        </g>
      ))}

      {/* صفّ خرّيجين بالصورة الظلّية */}
      <g fill="#0b1a3d" opacity="0.8">
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 70 + i * 135;
          return (
            <g key={i} transform={`translate(${x} 380)`}>
              <circle cx="0" cy="28" r="26" />
              <path d="M-30 18 30 18 0 4Z" />
              <path d="M-44 220c0-46 20-78 44-78s44 32 44 78z" />
            </g>
          );
        })}
      </g>

      <rect y="530" width="1200" height="70" fill="#0b1a3d" opacity="0.6" />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackdrop />
      <div className="absolute inset-0 bg-navy-900/35" />

      <div className="container-page relative py-20 text-center sm:py-28">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-bold text-white backdrop-blur">
          <Sparkles className="size-3.5 text-gold-400" />
          فرصتك الأكاديمية تبدأ من هنا
        </span>

        <h1 className="mx-auto mt-6 max-w-3xl font-display text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          اكتشف المنحة التي{" "}
          <span className="relative whitespace-nowrap text-gold-400">
            تناسب طموحك
            <span className="absolute inset-x-0 -bottom-1 h-1 rounded-full bg-gold-400/60" />
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-navy-100 sm:text-base">
          منصة «منحتي» تجمع لك آلاف الفرص الدراسية المتاحة حول العالم، وتستخدم أدوات ذكية لمطابقة
          ملفك الأكاديمي مع المنح المناسبة وتجهيز أوراقك للتقديم بكل سهولة.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/scholarships" variant="gold" size="lg">
            اكتشف المنح الآن
            <ArrowLeft className="size-4" />
          </ButtonLink>
          <ButtonLink
            href="/about"
            size="lg"
            className="border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            variant="ghost"
          >
            <PlayCircle className="size-4" />
            تعرّف على منحتي
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
