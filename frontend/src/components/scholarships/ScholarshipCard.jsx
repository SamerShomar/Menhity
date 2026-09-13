import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, Building2, CalendarDays, GraduationCap, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { cn, countryFlag, deadlineLabel } from "@/lib/utils";

const URGENCY_TONE = {
  closed: "danger",
  urgent: "danger",
  soon: "warning",
  open: "success",
};

/**
 * بطاقة منحة.
 * علم الدولة في شريط علوي منفصل حتى لا يتداخل الإيموجي مع العنوان العربي.
 */
export function ScholarshipCard({ scholarship, saved, onToggleSave, className }) {
  const {
    slug,
    title_ar: title,
    provider,
    country_code: countryCode,
    country_name_ar: country,
    funding_label: funding,
    days_until_deadline: days,
    deadline_urgency: urgency,
    levels = [],
    match_score: matchScore,
  } = scholarship;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-ink-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-navy-200",
        className,
      )}
    >
      {/* شريط العلم والدولة */}
      <div className="flex items-center justify-between gap-3 bg-navy-50 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="text-2xl leading-none" aria-hidden="true">
            {countryFlag(countryCode)}
          </span>
          <span className="truncate text-sm font-semibold text-navy-800">{country}</span>
        </div>

        <div className="flex items-center gap-2">
          {typeof matchScore === "number" ? (
            <Badge tone="gold">
              مطابقة <span className="num">{matchScore}%</span>
            </Badge>
          ) : null}

          {onToggleSave ? (
            <button
              type="button"
              onClick={() => onToggleSave(scholarship)}
              aria-label={saved ? "إزالة من المحفوظات" : "حفظ المنحة"}
              aria-pressed={Boolean(saved)}
              className="relative z-10 grid size-8 place-items-center rounded-lg bg-white text-ink-400 ring-1 ring-ink-200 transition hover:text-navy-700"
            >
              {saved ? <BookmarkCheck className="size-4 text-navy-700" /> : <Bookmark className="size-4" />}
            </button>
          ) : null}
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-display text-base leading-7 font-bold text-navy-800 group-hover:text-navy-600">
          <Link to={`/scholarships/${slug}`} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>

        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-500">
          <Building2 className="size-3.5 shrink-0" />
          <span className="truncate">{provider}</span>
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {levels.map((level) => (
            <Badge key={level.value} tone="navy">
              <GraduationCap className="size-3" />
              {level.label}
            </Badge>
          ))}
          <Badge tone="success">
            <Wallet className="size-3" />
            {funding}
          </Badge>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="flex items-center gap-1.5 text-[13px] text-ink-500">
            <CalendarDays className="size-3.5" />
            {deadlineLabel(days)}
          </span>
          <Badge tone={URGENCY_TONE[urgency] ?? "neutral"} dot>
            {urgency === "closed" ? "مغلقة" : urgency === "urgent" ? "تنتهي قريباً" : "مفتوحة"}
          </Badge>
        </div>
      </div>
    </article>
  );
}

/** هيكل تحميل بنفس أبعاد البطاقة */
export function ScholarshipCardSkeleton() {
  return (
    <div className="h-[260px] animate-pulse overflow-hidden rounded-2xl bg-white ring-1 ring-ink-200">
      <div className="h-12 bg-ink-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-ink-100" />
        <div className="h-3 w-1/2 rounded bg-ink-100" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-20 rounded-full bg-ink-100" />
          <div className="h-6 w-24 rounded-full bg-ink-100" />
        </div>
      </div>
    </div>
  );
}
