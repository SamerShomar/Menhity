import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  FileText,
  GraduationCap,
  Globe,
  Landmark,
  ListChecks,
  Sparkles,
  Target,
} from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEGREE_LABELS, FUNDING_LABELS, LANGUAGE_REQ_LABELS } from "@/lib/constants";
import {
  clamp,
  countryFlag,
  daysUntil,
  deadlineLabel,
  deadlineUrgency,
  formatDateAr,
  formatGpa,
} from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SaveButton } from "@/components/scholarships/save-button";
import { ShareButton } from "@/components/scholarships/share-button";

type Params = { params: Promise<{ slug: string }> };

async function getScholarship(slug: string) {
  return prisma.scholarship.findUnique({
    where: { slug },
    include: {
      levels: true,
      majors: { orderBy: { name: "asc" } },
      eligibility: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { sortOrder: "asc" } },
      benefits: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const scholarship = await prisma.scholarship.findUnique({
    where: { slug },
    select: { titleAr: true, description: true },
  });

  if (!scholarship) return { title: "المنحة غير موجودة" };

  return {
    title: scholarship.titleAr,
    description: scholarship.description?.slice(0, 160) ?? undefined,
  };
}

const SECTIONS = [
  { id: "about", label: "نبذة عن المنحة", icon: BookOpenCheck },
  { id: "eligibility", label: "شروط الأهلية", icon: ListChecks },
  { id: "majors", label: "التخصصات المطلوبة", icon: Target },
  { id: "documents", label: "المستندات المطلوبة", icon: FileText },
  { id: "benefits", label: "المزايا / التمويل", icon: Award },
];

export default async function ScholarshipDetailPage({ params }: Params) {
  const { slug } = await params;
  const scholarship = await getScholarship(slug);
  if (!scholarship) notFound();

  const user = await getCurrentUser();
  const saved = user
    ? Boolean(
        await prisma.savedScholarship.findUnique({
          where: { userId_scholarshipId: { userId: user.id, scholarshipId: scholarship.id } },
        }),
      )
    : false;

  // تقدّم الوقت بين تاريخ الفتح والموعد النهائي
  const days = daysUntil(scholarship.deadline);
  const urgency = deadlineUrgency(scholarship.deadline);
  const totalWindow =
    scholarship.openDate && scholarship.deadline
      ? Math.max(
          1,
          Math.round(
            (scholarship.deadline.getTime() - scholarship.openDate.getTime()) / 86_400_000,
          ),
        )
      : null;
  const elapsedPercent =
    totalWindow && days !== null ? clamp(((totalWindow - days) / totalWindow) * 100, 0, 100) : 0;

  const related = await prisma.scholarship.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: scholarship.id },
      OR: [
        { countryCode: scholarship.countryCode },
        { majors: { some: { name: { in: scholarship.majors.map((m) => m.name) } } } },
      ],
    },
    take: 3,
    orderBy: { deadline: "asc" },
    select: { id: true, slug: true, titleAr: true, countryCode: true, countryNameAr: true, deadline: true },
  });

  return (
    <div className="container-page py-8">
      {/* --- مسار التنقّل --- */}
      <nav aria-label="مسار التنقّل" className="mb-5 flex items-center gap-1.5 text-[12.5px] text-ink-500">
        <Link href="/" className="hover:text-navy-700">الرئيسية</Link>
        <ChevronLeft className="size-3.5" />
        <Link href="/scholarships" className="hover:text-navy-700">اكتشف المنح</Link>
        <ChevronLeft className="size-3.5" />
        <span className="truncate font-semibold text-ink-800">{scholarship.titleAr}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ======================= المحتوى ======================= */}
        <div className="space-y-5">
          {/* --- ترويسة المنحة --- */}
          <header className="rounded-2xl border border-ink-200 bg-white p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Badge tone="navy">{scholarship.provider}</Badge>
                <Badge tone="gold">{FUNDING_LABELS[scholarship.fundingType]}</Badge>
                {days !== null && days < 0 && <Badge tone="danger">انتهى التقديم</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <SaveButton scholarshipId={scholarship.id} saved={saved} variant="labelled" />
                )}
                <ShareButton title={scholarship.titleAr} />
              </div>
            </div>

            <h1 className="font-display text-2xl font-extrabold leading-snug text-navy-800 sm:text-3xl">
              {scholarship.titleAr}
            </h1>
            {scholarship.titleEn && (
              <p className="mt-1.5 text-[13px] text-ink-400" dir="ltr">
                {scholarship.titleEn}
              </p>
            )}

            <dl className="mt-6 grid gap-4 border-t border-ink-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
              <MetaItem icon={<Landmark className="size-4" />} label="الجهة المانحة">
                {scholarship.universityName ?? scholarship.provider}
              </MetaItem>
              <MetaItem icon={<Globe className="size-4" />} label="الدولة">
                <span className="me-1">{countryFlag(scholarship.countryCode)}</span>
                {scholarship.countryNameAr}
              </MetaItem>
              <MetaItem icon={<GraduationCap className="size-4" />} label="المستوى">
                {scholarship.levels.map((l) => DEGREE_LABELS[l.level]).join(" / ")}
              </MetaItem>
              <MetaItem icon={<CheckCircle2 className="size-4" />} label="معدل قبول الطلبات">
                {scholarship.acceptanceRate != null ? (
                  <span className="num">{scholarship.acceptanceRate}%</span>
                ) : (
                  "غير معلن"
                )}
              </MetaItem>
            </dl>
          </header>

          {/* --- 1) نبذة --- */}
          <Section id="about" n={1} icon={<BookOpenCheck className="size-4" />} title="نبذة عن المنحة">
            <p className="text-[14px] leading-loose text-ink-600">
              {scholarship.description ?? "لم تُضف نبذة لهذه المنحة بعد."}
            </p>
          </Section>

          {/* --- 2) شروط الأهلية --- */}
          {scholarship.eligibility.length > 0 && (
            <Section id="eligibility" n={2} icon={<ListChecks className="size-4" />} title="شروط الأهلية">
              <ul className="space-y-3">
                {scholarship.eligibility.map((item) => (
                  <li key={item.id} className="flex gap-2.5 text-[13.5px] leading-relaxed text-ink-600">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--color-success)]" />
                    {item.text}
                  </li>
                ))}
              </ul>

              {scholarship.minGpa != null && (
                <p className="mt-4 rounded-lg bg-ink-50 px-3.5 py-2.5 text-[12.5px] text-ink-600">
                  الحد الأدنى للمعدل التراكمي:{" "}
                  <span className="num font-bold text-navy-700">
                    {formatGpa(scholarship.minGpa, scholarship.gpaScale)}
                  </span>
                </p>
              )}
            </Section>
          )}

          {/* --- 3) التخصصات --- */}
          {scholarship.majors.length > 0 && (
            <Section id="majors" n={3} icon={<Target className="size-4" />} title="التخصصات المطلوبة">
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {scholarship.majors.map((major) => (
                  <li
                    key={major.id}
                    className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3 text-[13px] font-semibold text-ink-700"
                  >
                    <Target className="size-4 shrink-0 text-navy-500" />
                    {major.name}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* --- 4) المستندات --- */}
          {scholarship.documents.length > 0 && (
            <Section id="documents" n={4} icon={<FileText className="size-4" />} title="المستندات المطلوبة">
              <ul className="divide-y divide-ink-100">
                {scholarship.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="flex items-center gap-2.5 text-[13.5px] font-medium text-ink-700">
                      <FileText className="size-4 shrink-0 text-navy-500" />
                      {doc.name}
                    </span>
                    {doc.note && <Badge tone="neutral">{doc.note}</Badge>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* --- 5) المزايا --- */}
          {scholarship.benefits.length > 0 && (
            <Section id="benefits" n={5} icon={<Award className="size-4" />} title="المزايا / التمويل">
              <ul className="grid gap-3 sm:grid-cols-3">
                {scholarship.benefits.map((benefit) => (
                  <li key={benefit.id} className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                    <Award className="size-5 text-gold-600" />
                    <p className="mt-2.5 text-[13.5px] font-bold text-ink-900">{benefit.title}</p>
                    {benefit.description && (
                      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-500">
                        {benefit.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* --- منح ذات صلة --- */}
          {related.length > 0 && (
            <Section id="related" icon={<Sparkles className="size-4" />} title="منح قد تهمّك أيضاً">
              <ul className="divide-y divide-ink-100">
                {related.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/scholarships/${item.slug}`}
                      className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-navy-700"
                    >
                      <span className="flex items-center gap-2.5 text-[13.5px] font-medium">
                        <span>{countryFlag(item.countryCode)}</span>
                        {item.titleAr}
                      </span>
                      <span className="num shrink-0 text-[12px] text-ink-400">
                        {formatDateAr(item.deadline)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* ======================= السايدبار الثابت ======================= */}
        <aside className="lg:sticky lg:top-20 lg:h-fit lg:self-start">
          <div className="space-y-4">
            {/* --- الموعد النهائي --- */}
            <div className="rounded-2xl border border-ink-200 bg-white p-5">
              <div className="rounded-xl bg-gold-50 p-4">
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-gold-800">
                  <CalendarClock className="size-3.5" />
                  الموعد النهائي للتقديم
                </p>
                <p className="num mt-1.5 text-lg font-extrabold text-navy-800">
                  {formatDateAr(scholarship.deadline)}
                </p>
                <p
                  className={
                    urgency === "passed"
                      ? "mt-0.5 text-[12px] font-bold text-ink-400"
                      : urgency === "urgent"
                        ? "mt-0.5 text-[12px] font-bold text-danger"
                        : "mt-0.5 text-[12px] font-bold text-gold-700"
                  }
                >
                  {deadlineLabel(scholarship.deadline)}
                </p>
                {totalWindow && (
                  <Progress
                    value={elapsedPercent}
                    tone={urgency === "urgent" || urgency === "passed" ? "danger" : "gold"}
                    className="mt-3"
                    height={6}
                  />
                )}
              </div>

              <div className="mt-4 space-y-2.5">
                {scholarship.applyUrl ? (
                  <ButtonLink
                    href={scholarship.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    size="lg"
                  >
                    التقديم على المنحة
                    <ExternalLink className="size-4" />
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/tools/cv-builder" fullWidth size="lg">
                    جهّز طلبك للتقديم
                  </ButtonLink>
                )}

                <ButtonLink href="/tools/profile-review" variant="outline" fullWidth>
                  <Sparkles className="size-4 text-gold-500" />
                  مراجعة المستندات بالذكاء الاصطناعي
                </ButtonLink>
              </div>

              <p className="mt-3 text-center text-[11px] text-ink-400">
                {LANGUAGE_REQ_LABELS[scholarship.languageRequirement]}
              </p>
            </div>

            {/* --- محتويات الصفحة --- */}
            <nav className="rounded-2xl border border-ink-200 bg-white p-5">
              <h2 className="mb-3 text-[13px] font-bold text-ink-900">محتويات الصفحة</h2>
              <ol className="space-y-1">
                {SECTIONS.map((section, i) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12.5px] text-ink-600 transition-colors hover:bg-ink-50 hover:text-navy-700"
                    >
                      <span className="num flex size-5 shrink-0 items-center justify-center rounded-md bg-ink-100 text-[10px] font-bold text-ink-500">
                        {i + 1}
                      </span>
                      {section.label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-navy-500">{icon}</span>
      <div className="min-w-0">
        <dt className="text-[11px] text-ink-400">{label}</dt>
        <dd className="mt-0.5 truncate text-[13px] font-bold text-ink-800">{children}</dd>
      </div>
    </div>
  );
}

function Section({
  id,
  n,
  icon,
  title,
  children,
}: {
  id: string;
  n?: number;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-ink-200 bg-white p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-[15px] font-bold text-navy-800">
        <span className="text-navy-500">{icon}</span>
        {n != null && <span className="num">{n}.</span>}
        {title}
      </h2>
      {children}
    </section>
  );
}
