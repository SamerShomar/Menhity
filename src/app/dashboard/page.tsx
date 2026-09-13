import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  FileText,
  FileUser,
  FolderOpen,
  GraduationCap,
  PenLine,
  Sparkles,
  UserRound,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompletion } from "@/lib/profile-completion";
import { rankScholarships } from "@/lib/matching";
import { getOrCreateProfile } from "@/lib/student-data";
import { DEGREE_LABELS, DOCUMENT_KIND_LABELS } from "@/lib/constants";
import { formatGpa, timeAgoAr } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Progress } from "@/components/ui/progress";
import {
  DeadlineRow,
  MatchScholarshipCard,
} from "@/components/scholarships/scholarship-card";

export const metadata: Metadata = { title: "نظرة عامة" };

const PREP_TOOLS = [
  {
    href: "/tools/cv-builder",
    icon: FileUser,
    title: "السيرة الذاتية",
    text: "أنشئ سيرتك الذاتية وحسّنها لتكون جاهزة للتقديم.",
  },
  {
    href: "/tools/letter-builder",
    icon: PenLine,
    title: "منشئ رسالة الدافع",
    text: "أنشئ رسالة دافع مخصّصة للمنحة وحسّن محتواها.",
  },
  {
    href: "/dashboard/documents",
    icon: FolderOpen,
    title: "بنك المستندات",
    text: "احفظ مستنداتك المهمة ونظّمها للوصول إليها عند الحاجة.",
  },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);
  const { percent, sections } = computeCompletion(profile);

  const [publishedScholarships, savedRows, documents, upcoming] = await Promise.all([
    prisma.scholarship.findMany({
      where: { status: "PUBLISHED", deadline: { gte: new Date() } },
      include: { levels: true, majors: true },
      take: 40,
      orderBy: { deadline: "asc" },
    }),
    prisma.savedScholarship.findMany({
      where: { userId: user.id },
      select: { scholarshipId: true },
    }),
    prisma.document.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.scholarship.findMany({
      where: { status: "PUBLISHED", deadline: { gte: new Date() } },
      include: { levels: true },
      orderBy: { deadline: "asc" },
      take: 3,
    }),
  ]);

  const savedIds = new Set(savedRows.map((r) => r.scholarshipId));
  const ranked = rankScholarships(profile, publishedScholarships)
    .filter((r) => r.score > 0)
    .slice(0, 3);

  const latestEducation = profile.educations[0];
  const firstName = user.fullName.trim().split(/\s+/)[0];

  return (
    <div className="space-y-6">
      {/* --- الترحيب --- */}
      <section className="relative overflow-hidden rounded-2xl bg-navy-700 p-7 text-white">
        <div className="absolute inset-0 bg-gradient-to-l from-navy-600 via-navy-700 to-navy-900" />
        <span
          className="pointer-events-none absolute end-6 top-1/2 hidden -translate-y-1/2 text-[88px] leading-none opacity-15 sm:block"
          aria-hidden="true"
        >
          🎓
        </span>

        <div className="relative">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            مرحباً، {firstName} 👋
          </h1>
          <p className="mt-2 text-[13.5px] text-navy-100">
            {profile.headline ? `${profile.headline} | ` : ""}
            {profile.country ? `${profile.country}. ` : ""}
            اكتشف المنح المناسبة لك وتابع فرصك القادمة من مكان واحد.
          </p>
          <ButtonLink href="/scholarships" variant="gold" className="mt-5">
            اكتشف المنح
            <ArrowLeft className="size-4" />
          </ButtonLink>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        {/* ======================= العمود الرئيسي ======================= */}
        <div className="space-y-6">
          {/* --- إكمال الملف --- */}
          <Card>
            <CardBody>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-ink-900">إكمال الملف الشخصي</h2>
                  <p className="mt-1 text-[12.5px] text-ink-500">
                    أكمل ملفك لزيادة فرص تطابق المنح بنسبة <span className="num">40%</span>
                  </p>
                </div>
                <span className="num text-2xl font-extrabold text-navy-700">{percent}%</span>
              </div>

              <Progress value={percent} className="mt-4" />

              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
                {sections.map((section) => (
                  <li
                    key={section.key}
                    className={
                      section.done
                        ? "flex items-center gap-1.5 text-[12.5px] font-semibold text-[color:var(--color-success)]"
                        : "flex items-center gap-1.5 text-[12.5px] text-ink-400"
                    }
                    title={section.hint}
                  >
                    {section.done ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <Circle className="size-4" />
                    )}
                    {section.label}
                  </li>
                ))}
              </ul>

              {percent < 100 && (
                <ButtonLink href="/dashboard/profile" className="mt-5">
                  إكمال الملف
                </ButtonLink>
              )}
            </CardBody>
          </Card>

          {/* --- الملف الأكاديمي + المعلومات الشخصية --- */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader title="الملف الأكاديمي" icon={<GraduationCap className="size-4" />} />
              <CardBody className="pt-3">
                {latestEducation ? (
                  <dl className="space-y-2.5 text-[12.5px]">
                    <Row label="الدرجة">{DEGREE_LABELS[latestEducation.degree]}</Row>
                    <Row label="التخصص">{latestEducation.major ?? "—"}</Row>
                    <Row label="الجامعة">{latestEducation.institution}</Row>
                    <Row label="سنة التخرج">
                      <span className="num">{latestEducation.graduationYear ?? "—"}</span>
                    </Row>
                    <Row label="المعدل التراكمي">
                      <span className="num rounded-md bg-navy-50 px-2 py-0.5 font-bold text-navy-700">
                        {formatGpa(latestEducation.gpaValue, latestEducation.gpaScale)}
                      </span>
                    </Row>
                  </dl>
                ) : (
                  <p className="text-[12.5px] text-ink-400">
                    لم تضف مؤهلاً دراسياً بعد.{" "}
                    <Link href="/dashboard/profile" className="font-semibold text-navy-600 hover:underline">
                      أضف الآن
                    </Link>
                  </p>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="المعلومات الشخصية" icon={<UserRound className="size-4" />} />
              <CardBody className="pt-3">
                <dl className="space-y-2.5 text-[12.5px]">
                  <Row label="الاسم الكامل">{profile.fullNameAr ?? user.fullName}</Row>
                  <Row label="البريد الإلكتروني">
                    <span dir="ltr" className="truncate">{user.email}</span>
                  </Row>
                  <Row label="البلد">{profile.country ?? "—"}</Row>
                  <Row label="المدينة">{profile.city ?? "—"}</Row>
                </dl>
              </CardBody>
            </Card>
          </div>

          {/* --- المهارات والاهتمامات --- */}
          <Card>
            <CardHeader
              title="المهارات والاهتمامات"
              icon={<Sparkles className="size-4" />}
              action={
                <Link
                  href="/dashboard/profile"
                  className="text-[12px] font-semibold text-navy-600 hover:underline"
                >
                  تعديل
                </Link>
              }
            />
            <CardBody className="pt-3">
              {profile.skills.length === 0 && profile.interests.length === 0 ? (
                <p className="text-[12.5px] text-ink-400">لم تضف مهارات أو اهتمامات بعد.</p>
              ) : (
                <ul className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <li key={skill.id}>
                      <Badge tone="info">{skill.name}</Badge>
                    </li>
                  ))}
                  {profile.interests.map((interest) => (
                    <li key={interest.id}>
                      <Badge tone="gold">{interest.name}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* --- منح مناسبة لك --- */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-extrabold text-ink-900">منح مناسبة لك</h2>
                <p className="mt-1 text-[12.5px] text-ink-500">
                  منح اخترناها بناءً على تخصصك ومستواك الأكاديمي وبيانات ملفك.
                </p>
              </div>
              <Link
                href="/scholarships?sort=match"
                className="shrink-0 text-[12.5px] font-semibold text-navy-600 hover:underline"
              >
                عرض الكل
              </Link>
            </div>

            {ranked.length === 0 ? (
              <Card>
                <EmptyState
                  illustration={false}
                  icon={<GraduationCap className="size-6" />}
                  title="لا توجد اقتراحات بعد"
                  description="أكمل ملفك الأكاديمي (التعليم والتخصص والمهارات) لنبدأ باقتراح المنح الأنسب لك."
                  action={<ButtonLink href="/dashboard/profile">إكمال الملف الأكاديمي</ButtonLink>}
                />
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ranked.map(({ scholarship, score, reasons }) => (
                  <MatchScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                    score={score}
                    reasons={reasons}
                    saved={savedIds.has(scholarship.id)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* --- جهّز طلبك للتقديم --- */}
          <section>
            <div className="mb-4">
              <h2 className="font-display text-lg font-extrabold text-ink-900">
                جهّز طلبك للتقديم
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-500">
                استخدم أدوات منحتي لمساعدتك في تجهيز مستنداتك قبل موعد التقديم.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {PREP_TOOLS.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="group rounded-2xl bg-navy-700 p-5 text-white transition-all hover:-translate-y-0.5 hover:bg-navy-800"
                >
                  <tool.icon className="size-8 text-gold-400" strokeWidth={1.5} />
                  <h3 className="mt-4 text-[14px] font-bold">{tool.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-navy-100">{tool.text}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* --- تذكّر مواعيدك القادمة --- */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-display text-lg font-extrabold text-ink-900">
                تذكّر مواعيدك القادمة
              </h2>
              <Link
                href="/scholarships?sort=deadline"
                className="text-[12.5px] font-semibold text-navy-600 hover:underline"
              >
                عرض الكل
              </Link>
            </div>

            <div className="space-y-3">
              {upcoming.map((s) => (
                <DeadlineRow key={s.id} scholarship={s} />
              ))}
            </div>
          </section>
        </div>

        {/* ======================= العمود الجانبي ======================= */}
        <div className="space-y-4">
          {/* --- مستنداتي --- */}
          <Card>
            <CardHeader
              title="مستنداتي"
              icon={<FileText className="size-4" />}
              action={
                <Link
                  href="/dashboard/documents"
                  className="text-[12px] font-semibold text-navy-600 hover:underline"
                >
                  عرض الكل
                </Link>
              }
            />
            <CardBody className="pt-3">
              {documents.length === 0 ? (
                <p className="text-[12.5px] text-ink-400">لم ترفع أي مستند بعد.</p>
              ) : (
                <ul className="space-y-3">
                  {documents.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2.5">
                      <FileText className="size-4 shrink-0 text-navy-500" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12.5px] font-semibold text-ink-800">
                          {DOCUMENT_KIND_LABELS[doc.kind]}
                        </p>
                        <p className="text-[11px] text-ink-400">{timeAgoAr(doc.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {/* --- أدوات الذكاء الاصطناعي --- */}
          <div className="rounded-2xl border border-navy-100 bg-navy-50 p-5">
            <Sparkles className="size-6 text-navy-600" />
            <h3 className="mt-3 text-[14px] font-bold text-navy-800">أدوات الذكاء الاصطناعي</h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-navy-700/70">
              طوّر مستنداتك باحترافية لتناسب المنح المستهدفة.
            </p>
            <div className="mt-4 space-y-2">
              <ButtonLink href="/tools/cv-builder" size="sm" fullWidth>
                <FileUser className="size-3.5" />
                منشئ السيرة الذاتية
              </ButtonLink>
              <ButtonLink href="/tools/letter-builder" size="sm" fullWidth variant="outline">
                <PenLine className="size-3.5" />
                مساعد رسالة الدافع
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="shrink-0 text-ink-400">{label}</dt>
      <dd className="min-w-0 truncate font-semibold text-ink-800">{children}</dd>
    </div>
  );
}
