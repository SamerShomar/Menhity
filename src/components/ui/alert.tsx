import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<Tone, { box: string; icon: ReactNode }> = {
  info: {
    box: "bg-info-soft border-blue-200 text-[#1e3a8a]",
    icon: <Info className="size-4" />,
  },
  success: {
    box: "bg-success-soft border-green-200 text-[#14532d]",
    icon: <CheckCircle2 className="size-4" />,
  },
  warning: {
    box: "bg-warning-soft border-amber-200 text-[#78350f]",
    icon: <AlertTriangle className="size-4" />,
  },
  danger: {
    box: "bg-danger-soft border-red-200 text-[#7f1d1d]",
    icon: <XCircle className="size-4" />,
  },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const t = TONES[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px]", t.box, className)}
    >
      <span className="mt-0.5 shrink-0">{t.icon}</span>
      <div className="min-w-0 leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/** صندوق "نصيحة منحتي" الذي يظهر أسفل خطوات الويزرد */
export function TipBox({ children, title = "نصيحة منحتي للقبول" }: { children: ReactNode; title?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-navy-100 bg-navy-50/60 px-4 py-3">
      <span className="mt-0.5 text-lg leading-none">💡</span>
      <p className="text-[12.5px] leading-relaxed text-navy-800">
        <span className="font-bold">{title}: </span>
        {children}
      </p>
    </div>
  );
}
