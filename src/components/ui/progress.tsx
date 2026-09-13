import { cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "navy",
  height = 8,
}: {
  value: number;
  className?: string;
  tone?: "navy" | "gold" | "success" | "danger";
  height?: number;
}) {
  const pct = clamp(Math.round(value), 0, 100);
  const fill = {
    navy: "bg-navy-600",
    gold: "bg-gold-400",
    success: "bg-[color:var(--color-success)]",
    danger: "bg-[color:var(--color-danger)]",
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("w-full overflow-hidden rounded-full bg-ink-200", className)}
      style={{ height }}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", fill)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** حلقة تقدّم دائرية — تُستخدم لمعدل توافق ATS */
export function ProgressRing({
  value,
  size = 72,
  strokeWidth = 7,
  label,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const pct = clamp(value, 0, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ink-200)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-navy-600)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="num absolute text-sm font-bold text-navy-700">{label ?? `${pct}%`}</span>
    </div>
  );
}
