import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** يبني أرقام الصفحات مع اختصار (…) عند الأعداد الكبيرة */
function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("gap");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("gap");
  pages.push(total);

  return pages;
}

export function Pagination({
  page,
  totalPages,
  buildHref,
  className,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const itemClass =
    "inline-flex size-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-[13px] font-semibold text-ink-600 transition-colors hover:border-navy-300 hover:text-navy-700";

  return (
    <nav className={cn("flex items-center justify-center gap-1.5", className)} aria-label="ترقيم الصفحات">
      {/* في الواجهة العربية: "السابق" على اليمين ويشير سهمه لليمين */}
      {page > 1 ? (
        <Link href={buildHref(page - 1)} className={itemClass} aria-label="الصفحة السابقة">
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemClass, "cursor-not-allowed opacity-40")} aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      )}

      {pageList(page, totalPages).map((p, i) =>
        p === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              itemClass,
              "num",
              p === page && "border-navy-700 bg-navy-700 text-white hover:text-white",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={buildHref(page + 1)} className={itemClass} aria-label="الصفحة التالية">
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(itemClass, "cursor-not-allowed opacity-40")} aria-hidden="true">
          <ChevronLeft className="size-4" />
        </span>
      )}
    </nav>
  );
}
