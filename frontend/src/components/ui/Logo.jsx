import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

/**
 * شعار منحتي: كتاب مفتوح تعلوه طائرة.
 *
 * مرسوم متجهاً لا صورة نقطية: يكبر بلا تحبّب، وحجمه بالبايتات، ويتلوّن
 * أبيض على الخلفيات الداكنة دون ملف ثانٍ.
 */
export function LogoMark({ className, tone = "navy" }) {
  const ink = tone === "white" ? "#ffffff" : "#14306b";

  return (
    <svg viewBox="0 0 64 64" fill="none" className={cn("size-9", className)} aria-hidden="true">
      {/* الصفحتان تنفتحان من الكعب — قمّتان وفجوة في المنتصف */}
      <path
        d="M32 19.5C27 15.8 21.5 14.2 15 14.2v26.1c6.5 0 12 1.6 17 5.3 5-3.7 10.5-5.3 17-5.3V14.2c-6.5 0-12 1.6-17 5.3Z"
        stroke={ink}
        strokeWidth="4.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* الكعب */}
      <path d="M32 19.5v26.1" stroke={ink} strokeWidth="4.2" strokeLinecap="round" />
      {/* الغلاف يهبط إلى رأس مستدير فيغلق الشكل كدرع */}
      <path
        d="M15 40.3c0 4.4 3.1 8.2 8.8 11.4L32 55.8l8.2-4.1c5.7-3.2 8.8-7 8.8-11.4"
        stroke={ink}
        strokeWidth="4.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* أثر التحليق — قوس صاعد نحو اليمين خلف الطائرة */}
      <path
        d="M20.5 34.5c7 4.6 15 3.3 22-3.9"
        stroke={ink}
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* الطائرة صاعدة، متجاوزة حدّ الكتاب من أعلى اليمين */}
      <g transform="translate(48.5 10.5) rotate(45) scale(0.8)">
        <path
          d="M0 -14.5c1.8 0 2.9 2.6 2.9 5.7v5.6L14.8 4v3.4L2.9 4.9v6.2l3.5 3.2v2.5L0 14.9l-6.4 1.9v-2.5l3.5-3.2V4.9L-14.8 7.4V4l11.9-7.2v-5.6c0-3.1 1.1-5.7 2.9-5.7Z"
          fill={ink}
        />
      </g>
    </svg>
  );
}

export function Logo({ tone = "navy", withText = true, className, to = "/" }) {
  return (
    <Link to={to} className={cn("inline-flex items-center gap-2", className)} aria-label="منحتي">
      <LogoMark tone={tone} />
      {withText && (
        <span
          className={cn(
            "font-display text-lg font-extrabold tracking-tight",
            tone === "white" ? "text-white" : "text-navy-800",
          )}
        >
          منحتي
        </span>
      )}
    </Link>
  );
}
