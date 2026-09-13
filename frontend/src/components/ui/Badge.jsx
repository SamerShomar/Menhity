import { cn } from "@/lib/utils";

const TONES = {
  navy: "bg-navy-700 text-white",
  gold: "bg-gold-100 text-gold-800 border border-gold-300",
  success: "bg-success-soft text-[#166534] border border-green-200",
  warning: "bg-warning-soft text-[#92400e] border border-amber-200",
  danger: "bg-danger-soft text-[#991b1b] border border-red-200",
  info: "bg-info-soft text-[#1e40af] border border-blue-200",
  neutral: "bg-ink-100 text-ink-600 border border-ink-200",
  outline: "bg-white text-ink-600 border border-ink-300",
};

export function Badge({ tone = "neutral", dot, className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none whitespace-nowrap",
        TONES[tone] ?? TONES.neutral,
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
