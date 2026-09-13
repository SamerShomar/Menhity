import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type Step = { n: number; label: string };

export function Stepper({
  steps,
  current,
  hrefFor,
  maxReachable,
}: {
  steps: Step[];
  current: number;
  hrefFor: (n: number) => string;
  /** أقصى خطوة يمكن الانتقال إليها (الخطوات اللاحقة معطّلة) */
  maxReachable?: number;
}) {
  const limit = maxReachable ?? steps.length;

  return (
    <ol className="flex items-start justify-between gap-1">
      {steps.map((step, i) => {
        const done = step.n < current;
        const active = step.n === current;
        const reachable = step.n <= limit;

        const circle = (
          <span
            className={cn(
              "relative z-10 flex size-8 items-center justify-center rounded-full text-[12px] font-bold ring-4 ring-white transition-colors",
              done
                ? "bg-[color:var(--color-success)] text-white"
                : active
                  ? "bg-navy-700 text-white"
                  : "bg-ink-200 text-ink-500",
            )}
          >
            {done ? <Check className="size-4" strokeWidth={3} /> : <span className="num">{step.n}</span>}
          </span>
        );

        return (
          <li key={step.n} className="relative flex flex-1 flex-col items-center text-center">
            {/* الخط الواصل — في الواجهة العربية يمتد نحو اليسار */}
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "absolute end-1/2 top-4 h-0.5 w-full",
                  done ? "bg-[color:var(--color-success)]" : "bg-ink-200",
                )}
                aria-hidden="true"
              />
            )}

            {reachable && !active ? (
              <Link href={hrefFor(step.n)} aria-label={`الانتقال إلى ${step.label}`}>
                {circle}
              </Link>
            ) : (
              circle
            )}

            <span
              className={cn(
                "mt-2 max-w-[9rem] text-[11.5px] leading-tight",
                active ? "font-bold text-navy-800" : "text-ink-500",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
