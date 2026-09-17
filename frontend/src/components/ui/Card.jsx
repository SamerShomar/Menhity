import { cn } from "@/lib/utils";

export function Card({ as: Tag = "div", className, children }) {
  return (
    <Tag
      className={cn(
        "glass rounded-2xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, icon, action, className }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="flex items-start gap-2.5">
        {icon && <span className="mt-0.5 text-navy-600">{icon}</span>}
        <div>
          <h3 className="text-base font-bold text-ink-900">{title}</h3>
          {subtitle && <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
