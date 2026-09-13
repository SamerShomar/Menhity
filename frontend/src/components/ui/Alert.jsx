import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const TONES = {
  info: { box: "bg-info-soft border-blue-200 text-[#1e3a8a]", Icon: Info },
  success: { box: "bg-success-soft border-green-200 text-[#14532d]", Icon: CircleCheck },
  warning: { box: "bg-warning-soft border-amber-200 text-[#78350f]", Icon: TriangleAlert },
  danger: { box: "bg-danger-soft border-red-200 text-[#7f1d1d]", Icon: CircleAlert },
};

export function Alert({ tone = "info", title, className, children }) {
  const { box, Icon } = TONES[tone] ?? TONES.info;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px]", box, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/** صندوق "نصيحة منحتي" أسفل خطوات الويزرد */
export function TipBox({ title = "نصيحة منحتي للقبول", children }) {
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
