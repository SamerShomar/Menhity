import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * شعار منحتي — كتاب مفتوح تنطلق منه طائرة ورقية،
 * يجمع بين الدراسة والسفر. مرسوم كـ SVG ليعمل بأي حجم.
 */
export function LogoMark({ className, tone = "navy" }: { className?: string; tone?: "navy" | "white" }) {
  const stroke = tone === "white" ? "#ffffff" : "#14306b";
  const accent = tone === "white" ? "#f6c445" : "#f6c445";

  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("size-9", className)} aria-hidden="true">
      <path
        d="M7 13.5c4.6-2.2 9.2-2.2 13.8 0v22c-4.6-2.2-9.2-2.2-13.8 0v-22Z"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path
        d="M27.2 13.5c4.6-2.2 9.2-2.2 13.8 0v22c-4.6-2.2-9.2-2.2-13.8 0"
        stroke={stroke}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <path d="M24 12.8v22.7" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M41 7 26.5 19.5l3.6 5.2L41 7Z" fill={accent} />
      <path d="M41 7 30.1 24.7l-3.6-5.2L41 7Z" fill={accent} fillOpacity="0.65" />
    </svg>
  );
}

export function Logo({
  tone = "navy",
  withText = true,
  className,
  href = "/",
}: {
  tone?: "navy" | "white";
  withText?: boolean;
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label="منحتي">
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
