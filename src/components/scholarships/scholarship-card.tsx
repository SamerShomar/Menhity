import Link from "next/link";
import { CalendarDays, ChevronDown, GraduationCap, Globe, Languages, Wallet } from "lucide-react";
import type { DegreeLevel, FundingType, LanguageRequirement } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SaveButton } from "@/components/scholarships/save-button";
import {
  DEGREE_LABELS,
  FUNDING_LABELS,
  LANGUAGE_REQ_LABELS,
} from "@/lib/constants";
import {
  cn,
  countryFlag,
  daysUntil,
  deadlineLabel,
  deadlineUrgency,
  formatDateAr,
} from "@/lib/utils";

export type CardScholarship = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string | null;
  provider: string;
  countryCode: string;
  countryNameAr: string;
  region: string | null;
  fundingType: FundingType;
  languageRequirement: LanguageRequirement;
  deadline: Date | null;
  levels: { level: DegreeLevel }[];
};

function levelsText(levels: { level: DegreeLevel }[]): string {
  return levels.map((l) => DEGREE_LABELS[l.level]).join(" · ");
}

/* ============================================================
   بطاقة المنحة في صفحة التصفّح
   ============================================================ */

export function ScholarshipCard({
  scholarship,
  saved = false,
  matchScore,
  showSave = true,
}: {
  scholarship: CardScholarship;
  saved?: boolean;
  matchScore?: number | null;
  showSave?: boolean;
}) {
  const days = daysUntil(scholarship.deadline);
  const urgency = deadlineUrgency(scholarship.deadline);
  const isOpen = days === null || days >= 0;

  return (
    <article className="group flex flex-col rounded-2xl border border-ink-200 bg-white p-4 shadow-[0_1px_2px_rgb(15_23_42/0.04)] transition-shadow hover:shadow-[0_12px_32px_-16px_rgb(15_23_42/0.22)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {showSave && <SaveButton scholarshipId={scholarship.id} saved={saved} />}
          <Badge tone={isOpen ? "success" : "danger"} dot>
            {isOpen ? "مفتوح" : "مغلق"}
          </Badge>
        </div>
        <span className="text-2xl leading-none" aria-hidden="true">
          {countryFlag(scholarship.countryCode)}
        </span>
      </div>

      <h3 className="text-[15px] font-bold leading-snug text-navy-800">
        <Link href={`/scholarships/${scholarship.slug}`} className="hover:underline">
          {scholarship.titleAr}
        </Link>
      </h3>
      {scholarship.titleEn && (
        <p className="mt-0.5 text-[12px] text-ink-400" dir="ltr">
          {scholarship.titleEn}
        </p>
      )}

      {typeof matchScore === "number" && matchScore > 0 && (
        <span className="mt-2.5 inline-flex w-fit items-center gap-1.5 rounded-lg bg-gold-100 px-2.5 py-1 text-[11.5px] font-bold text-gold-800">
          ✨ مطابقة بنسبة <span className="num">{matchScore}%</span> لملفك
        </span>
      )}

      <ul className="mt-3.5 space-y-2 text-[12.5px] text-ink-600">
        <MetaRow icon={<Globe className="size-3.5" />}>{scholarship.countryNameAr}</MetaRow>
        <MetaRow icon={<GraduationCap className="size-3.5" />}>
          {levelsText(scholarship.levels)}
        </MetaRow>
        <MetaRow icon={<Wallet className="size-3.5" />}>
          {FUNDING_LABELS[scholarship.fundingType]}
        </MetaRow>
        <MetaRow icon={<Languages className="size-3.5" />}>
          {LANGUAGE_REQ_LABELS[scholarship.languageRequirement]}
        </MetaRow>
      </ul>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-ink-100 pt-3.5">
        <div>
          <p className="text-[11px] text-ink-400">الموعد النهائي:</p>
          <p
            className={cn(
              "num text-[13px] font-bold",
              urgency === "passed"
                ? "text-ink-400 line-through"
                : urgency === "urgent"
                  ? "text-danger"
                  : "text-ink-800",
            )}
          >
            {formatDateAr(scholarship.deadline)}
          </p>
        </div>
        <ButtonLink href={`/scholarships/${scholarship.slug}`} size="sm">
          عرض التفاصيل
        </ButtonLink>
      </div>
    </article>
  );
}

function MetaRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <span className="text-ink-400">{icon}</span>
      {children}
    </li>
  );
}

/* ============================================================
   بطاقة مميّزة — تُستخدم في شريط "اكتشف فرصتك القادمة"
   ============================================================ */

export function FeaturedScholarshipCard({ scholarship }: { scholarship: CardScholarship }) {
  return (
    <Link
      href={`/scholarships/${scholarship.slug}`}
      className="group relative flex h-64 w-64 shrink-0 flex-col justify-end overflow-hidden rounded-2xl bg-navy-700 p-4 text-white shadow-[0_12px_32px_-16px_rgb(15_23_42/0.4)] transition-transform hover:-translate-y-1"
    >
      {/* خلفية متدرّجة + علم الدولة */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-500/40 to-navy-900" />
      <span
        className="absolute inset-x-0 top-6 text-center text-[72px] leading-none opacity-90 blur-[0.3px]"
        aria-hidden="true"
      >
        {countryFlag(scholarship.countryCode)}
      </span>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/60 to-transparent" />

      <Badge
        tone={scholarship.fundingType === "FULL" ? "danger" : "gold"}
        className="absolute end-3 top-3"
      >
        {FUNDING_LABELS[scholarship.fundingType]}
      </Badge>

      <div className="relative">
        <h3 className="text-[15px] font-bold leading-snug">{scholarship.titleAr}</h3>
        <p className="mt-1 text-[11.5px] text-navy-100">{levelsText(scholarship.levels)}</p>
        <p className="num mt-2 text-[11.5px] font-semibold text-gold-300">
          آخر موعد للتقديم {formatDateAr(scholarship.deadline)}
        </p>
        <span className="mt-2 inline-block text-[12px] font-bold text-white underline-offset-4 group-hover:underline">
          عرض التفاصيل
        </span>
      </div>
    </Link>
  );
}

/* ============================================================
   بطاقة "منح مناسبة لك" — بنسبة المطابقة والأسباب
   ============================================================ */

export function MatchScholarshipCard({
  scholarship,
  score,
  reasons,
  saved = false,
}: {
  scholarship: CardScholarship;
  score: number;
  reasons: string[];
  saved?: boolean;
}) {
  return (
    <article className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl bg-navy-800 p-4 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-500 to-navy-900" />
      <span
        className="absolute inset-x-0 top-10 text-center text-[86px] leading-none opacity-40"
        aria-hidden="true"
      >
        {countryFlag(scholarship.countryCode)}
      </span>
      <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/70 to-navy-900/10" />

      <div className="absolute inset-x-3 top-3 flex items-start justify-between">
        <SaveButton scholarshipId={scholarship.id} saved={saved} />
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy-800">
          <span className="num">{score}%</span> مناسبة لك
        </span>
      </div>

      <div className="relative">
        <p className="text-[11.5px] text-navy-100">{scholarship.countryNameAr}</p>
        <h3 className="mt-0.5 text-[15px] font-bold leading-snug">{scholarship.titleAr}</h3>
        {scholarship.titleEn && (
          <p className="text-[11px] text-navy-200" dir="ltr">
            ({scholarship.titleEn})
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-white/15 px-2 py-1 text-[10.5px] font-semibold">
            {levelsText(scholarship.levels)}
          </span>
          <span className="rounded-md bg-white/15 px-2 py-1 text-[10.5px] font-semibold">
            {FUNDING_LABELS[scholarship.fundingType]}
          </span>
        </div>

        {reasons.length > 0 && (
          <details className="mt-3 border-t border-white/15 pt-2.5">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[12px] font-semibold text-gold-300">
              لماذا تناسبني؟
              <ChevronDown className="size-3.5 transition-transform [details[open]_&]:rotate-180" />
            </summary>
            <ul className="mt-2 space-y-1.5">
              {reasons.slice(0, 3).map((reason, i) => (
                <li key={i} className="flex gap-1.5 text-[11px] leading-relaxed text-navy-100">
                  <span className="text-gold-400">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   صف أفقي — "تذكّر مواعيدك القادمة"
   ============================================================ */

export function DeadlineRow({ scholarship }: { scholarship: CardScholarship }) {
  const urgency = deadlineUrgency(scholarship.deadline);

  const badgeTone =
    urgency === "passed" ? "neutral" : urgency === "urgent" ? "danger" : urgency === "soon" ? "warning" : "info";

  return (
    <article className="relative flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-navy-800 p-4 text-white">
      <div className="absolute inset-0 bg-gradient-to-l from-navy-600 to-navy-900" />
      <span className="absolute end-6 top-1/2 -translate-y-1/2 text-5xl opacity-30" aria-hidden="true">
        {countryFlag(scholarship.countryCode)}
      </span>

      <div className="relative min-w-0">
        <Badge tone={badgeTone} className="mb-2">
          {deadlineLabel(scholarship.deadline)}
        </Badge>
        <h3 className="truncate text-[14px] font-bold">{scholarship.titleAr}</h3>
        <p className="mt-0.5 text-[11.5px] text-navy-100">
          {levelsText(scholarship.levels)} · {scholarship.countryNameAr}
        </p>
        <p className="num mt-2 flex items-center gap-1.5 text-[11.5px] text-navy-100">
          <CalendarDays className="size-3.5" />
          آخر موعد للتقديم: {formatDateAr(scholarship.deadline)}
        </p>
      </div>

      <Link
        href={`/scholarships/${scholarship.slug}`}
        className="relative shrink-0 text-[12.5px] font-bold text-gold-300 underline-offset-4 hover:underline"
      >
        التفاصيل
      </Link>
    </article>
  );
}
