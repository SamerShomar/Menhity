import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

export function LogoMark({ className, tone = "navy" }) {
  const stroke = tone === "white" ? "#ffffff" : "#14306b";

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
      <path d="M41 7 26.5 19.5l3.6 5.2L41 7Z" fill="#f6c445" />
      <path d="M41 7 30.1 24.7l-3.6-5.2L41 7Z" fill="#f6c445" fillOpacity="0.65" />
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
