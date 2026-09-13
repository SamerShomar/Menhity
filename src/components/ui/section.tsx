import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "text-start",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 text-[13px] font-bold tracking-wide text-gold-600">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-extrabold text-ink-900 sm:text-[28px]">{title}</h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-ink-500 sm:text-[15px]">{description}</p>
      )}
    </div>
  );
}
