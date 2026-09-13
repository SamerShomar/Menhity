import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export function AdminPageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">{title}</h1>
          {badge && <Badge tone="success">{badge}</Badge>}
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-ink-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
