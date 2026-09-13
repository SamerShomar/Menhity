import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "navy",
  className,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: ReactNode;
  tone?: "navy" | "gold" | "success" | "danger" | "info";
  className?: string;
}) {
  const iconTone = {
    navy: "bg-navy-50 text-navy-600",
    gold: "bg-gold-100 text-gold-700",
    success: "bg-success-soft text-[#166534]",
    danger: "bg-danger-soft text-[#991b1b]",
    info: "bg-info-soft text-[#1e40af]",
  }[tone];

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border border-ink-200 bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)]",
        className,
      )}
    >
      {icon && (
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", iconTone)}>
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="num text-xl font-extrabold leading-tight text-ink-900">{value}</p>
        <p className="mt-0.5 truncate text-[12px] font-medium text-ink-500">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-ink-400">{hint}</p>}
      </div>
    </div>
  );
}
