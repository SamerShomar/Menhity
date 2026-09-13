import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  CircleAlert,
  Eye,
  GraduationCap,
  Languages,
  Lightbulb,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/student-data";
import { DEGREE_LABELS, EXPERIENCE_TYPE_LABELS, SKILL_SUGGESTIONS } from "@/lib/constants";
import {
  deleteCertificationAction,
  deleteEducationAction,
  deleteExperienceAction,
  deleteProjectAction,
  removeLanguageAction,
  removeSkillAction,
} from "@/app/actions/profile";
import { formatGpa, formatMonthYearAr } from "@/lib/utils";

import { Alert, TipBox } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Stepper } from "@/components/tools/stepper";
import { SubmitOrderForm } from "@/components/tools/submit-order-form";
import {
  AddCertificationForm,
  AddEducationForm,
  AddExperienceForm,
  AddLanguageForm,
  AddProjectForm,
  PersonalInfoForm,
  SkillAdder,
} from "@/components/dashboard/profile-forms";

export const metadata: Metadata = { title: "أنشئ سيرتك الذاتية" };

const STEPS = [
  { n: 1, label: "المعلومات الشخصية" },
  { n: 2, label: "التعليم والمؤهلات" },
  { n: 3, label: "الخبرات والأنشطة" },
  { n: 4, label: "المهارات والإنجازات" },
  { n: 5, label: "المراجعة والإرسال" },
];

const TIPS: Record<number, string> = {
  1: "النبذة الشخصية هي أول ما تقرأه لجنة التقييم — اجعلها محدّدة وموجّهة لهدفك الأكاديمي، لا عامة.",
  2: "لجان المنح العالمية تفضّل ذكر نظام الدرجات المعتمد بجانب المعدل (مثل 3.88 من 4.00) أو النسبة المئوية.",
  3: "ابدأ كل جملة بفعل قوي واذكر أرقاماً ونتائج ملموسة — «رفعت دقة النموذج من 82% إلى 94%» أقوى من «حسّنت الأداء».",
  4: "لجان المنح العالمية مثل DAAD و Chevening تولي أهمية مضاعفة للمهارات القيادية والمشاريع ذات الأثر المجتمعي الواضح.",
  5: "راجع بياناتك جيداً قبل الإرسال — الخبير سيصيغ سيرتك بناءً على ما أدخلته هنا بالضبط.",
};

function DeleteChip({
  action,
  id,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-1 rounded-full border border-ink-200 bg-ink-50 py-1 pe-1 ps-3 text-[12px] font-semibold text-ink-700">
      {children}
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          aria-label="حذف"
          className="rounded-full p-1 text-ink-400 transition-colors hover:bg-danger-soft hover:text-danger"
        >
          ✕
        </button>
      </form>
    </li>
  );
}

export default async function CvBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const user = await requireUser();
  const { step: stepParam } = await searchParams;

  // طلب قائم بالفعل؟ ننتقل مباشرة لصفحة المتابعة
  const activeOrder = await prisma.cvOrder.findFirst({
    where: {
      userId: user.id,
      status: { in: ["SUBMITTED", "IN_EXPERT_REVIEW", "ATS_CHECK", "DELIVERED"] },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (activeOrder) redirect(`/tools/cv-builder/orders/${activeOrder.id}`);

  const step = Math.min(5, Math.max(1, Number(stepParam) || 1));
  const profile = await getOrCreateProfile(user.id);
  const account = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { phone: true, email: true },
  });

  const existingSkills = new Set(profile.skills.map((s) => s.name));
  const skillSuggestions = SKILL_SUGGESTIONS.filter((s) => !existingSkills.has(s)).slice(0, 4);

  // شروط جاهزية الإرسال
  const readiness = [
    { label: "المعلومات الشخصية والنبذة", done: Boolean(profile.fullNameAr && profile.bio) },
    { label: "مؤهل دراسي واحد على الأقل", done: profile.educations.length > 0 },
    { label: "خبرة أو مشروع واحد على الأقل", done: profile.experiences.length + profile.projects.length > 0 },
    { label: "3 مهارات على الأقل", done: profile.skills.length >= 3 },
    { label: "لغة واحدة على الأقل", done: profile.languages.length > 0 },
  ];
  const ready = readiness.every((r) => r.done);

  const hrefFor = (n: number) => `/tools/cv-builder?step=${n}`;

  return (
    <div className="container-page py-10">
      <header className="mb-8 text-center">
        <h1 className="font-display text-2xl font-extrabold text-navy-800 sm:text-3xl">
          أنشئ سيرتك الذاتية بالذكاء الاصطناعي
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-[13.5px] leading-relaxed text-ink-500">
          أنشئ سيرة ذاتية احترافية تبرز مهاراتك وخبراتك وتساعدك على الاستعداد الأمثل للتقديم
          والقبول بالمنح الدولية.
        </p>
      </header>

      {/* --- شريط الخطوات --- */}
      <div className="mx-auto mb-8 max-w-3xl">
        <Stepper steps={STEPS} current={step} hrefFor={hrefFor} />
      </div>

      <div className="mx-auto max-w-4xl space-y-5">
        <Card>
          <CardHeader
            title={STEPS[step - 1]!.label}
            subtitle={`الخطوة ${step} من 5`}
            icon={<StepIcon step={step} />}
            action={
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[color:var(--color-success)]">
                <Save className="size-3.5" />
                يتم الحفظ تلقائياً
              </span>
            }
          />

          <CardBody className="pt-4">
            {/* ---------------- الخطوة 1 ---------------- */}
            {step === 1 && (
              <>
                <p className="mb-5 text-[12.5px] leading-relaxed text-ink-500">
                  أدخل بيانات التواصل الأساسية بدقة — هذه المعلومات هي أول ما تطّلع عليه لجان تقييم
                  المنح الدراسية.
                </p>
                <PersonalInfoForm
                  defaults={{
                    fullNameAr: profile.fullNameAr ?? "",
                    fullNameEn: profile.fullNameEn ?? "",
                    academicEmail: profile.academicEmail ?? account.email,
                    phone: account.phone ?? "",
                    birthDate: profile.birthDate ? profile.birthDate.toISOString().slice(0, 10) : "",
                    nationality: profile.nationality ?? "",
                    gender: profile.gender ?? "",
                    country: profile.country ?? "",
                    city: profile.city ?? "",
                    linkedinUrl: profile.linkedinUrl ?? "",
                    portfolioUrl: profile.portfolioUrl ?? "",
                    bio: profile.bio ?? "",
                  }}
                />
              </>
            )}

            {/* ---------------- الخطوة 2 ---------------- */}
            {step === 2 && (
              <>
                <p className="mb-5 text-[12.5px] leading-relaxed text-ink-500">
                  أضف مؤهلاتك الأكاديمية والدرجات العلمية، فالمعدل والجامعة والتخصص من أهم معايير
                  التقييم لدى لجان المنح.
                </p>

                {profile.educations.length > 0 ? (
                  <ul className="mb-5 divide-y divide-ink-100">
                    {profile.educations.map((edu) => (
                      <li key={edu.id} className="flex items-start justify-between gap-3 py-3">
                        <div>
                          <p className="text-[13.5px] font-bold text-ink-900">
                            {DEGREE_LABELS[edu.degree]}
                            {edu.major ? ` — ${edu.major}` : ""}
                          </p>
                          <p className="mt-0.5 text-[12px] text-ink-500">{edu.institution}</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {edu.graduationYear && (
                              <Badge tone="neutral">
                                <span className="num">{edu.graduationYear}</span>
                              </Badge>
                            )}
                            {edu.gpaValue != null && (
                              <Badge tone="info">
                                <span className="num">{formatGpa(edu.gpaValue, edu.gpaScale)}</span>
                              </Badge>
                            )}
                            {edu.isCurrent && <Badge tone="gold">قيد الدراسة</Badge>}
                          </div>
                        </div>
                        <form action={deleteEducationAction}>
                          <input type="hidden" name="id" value={edu.id} />
                          <button
                            type="submit"
                            className="rounded-lg px-2 py-1 text-[11.5px] font-semibold text-danger hover:bg-danger-soft"
                          >
                            حذف
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Alert tone="warning" className="mb-5">
                    لم تُضف أي مؤهل بعد — أضف مؤهلك الحالي أو الأحدث للمتابعة.
                  </Alert>
                )}

                <AddEducationForm />
              </>
            )}

            {/* ---------------- الخطوة 3 ---------------- */}
            {step === 3 && (
              <>
                <p className="mb-5 text-[12.5px] leading-relaxed text-ink-500">
                  أضف خبراتك العملية والتدريب والأنشطة البحثية والتطوعية — تولي لجان تقييم المنح
                  اهتماماً كبيراً للأثر الملموس والمهارات القيادية.
                </p>

                {profile.experiences.length > 0 && (
                  <ul className="mb-5 divide-y divide-ink-100">
                    {profile.experiences.map((exp) => (
                      <li key={exp.id} className="flex items-start justify-between gap-3 py-3">
                        <div>
                          <p className="text-[13.5px] font-bold text-ink-900">{exp.title}</p>
                          <p className="mt-0.5 text-[12px] text-ink-500">{exp.organization}</p>
                          <p className="num mt-1 text-[11.5px] text-ink-400">
                            {formatMonthYearAr(exp.startDate)} —{" "}
                            {exp.isCurrent ? "حتى الآن" : formatMonthYearAr(exp.endDate)}
                          </p>
                          <div className="mt-1.5">
                            <Badge tone="neutral">{EXPERIENCE_TYPE_LABELS[exp.type]}</Badge>
                          </div>
                        </div>
                        <form action={deleteExperienceAction}>
                          <input type="hidden" name="id" value={exp.id} />
                          <button
                            type="submit"
                            className="rounded-lg px-2 py-1 text-[11.5px] font-semibold text-danger hover:bg-danger-soft"
                          >
                            حذف
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                <AddExperienceForm />
              </>
            )}

            {/* ---------------- الخطوة 4 ---------------- */}
            {step === 4 && (
              <div className="space-y-7">
                <section>
                  <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-bold text-ink-900">
                    <Sparkles className="size-4 text-navy-500" />
                    المهارات الرئيسية
                  </h3>
                  <p className="mb-3 text-[12px] text-ink-500">
                    أضف الكفاءات التقنية والمهارات الشخصية التي تنافس عليها الدراسات العليا.
                  </p>

                  {profile.skills.length > 0 && (
                    <ul className="mb-4 flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <DeleteChip key={skill.id} action={removeSkillAction} id={skill.id}>
                          {skill.name}
                        </DeleteChip>
                      ))}
                    </ul>
                  )}

                  <SkillAdder suggestions={skillSuggestions} />
                </section>

                <section className="border-t border-ink-100 pt-6">
                  <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-bold text-ink-900">
                    <Languages className="size-4 text-navy-500" />
                    اللغات وإتقانها
                  </h3>
                  <p className="mb-3 text-[12px] text-ink-500">
                    معيار أساسي لمنح الدولية مع توثيق شهادات مثل IELTS أو TOEFL.
                  </p>

                  {profile.languages.length > 0 && (
                    <ul className="mb-4 flex flex-wrap gap-2">
                      {profile.languages.map((lang) => (
                        <DeleteChip key={lang.id} action={removeLanguageAction} id={lang.id}>
                          {lang.name} — {lang.proficiency}
                          {lang.certificate ? ` (${lang.certificate})` : ""}
                        </DeleteChip>
                      ))}
                    </ul>
                  )}

                  <AddLanguageForm />
                </section>

                <section className="border-t border-ink-100 pt-6">
                  <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-bold text-ink-900">
                    <Award className="size-4 text-navy-500" />
                    الشهادات والاعتمادات
                  </h3>
                  <p className="mb-3 text-[12px] text-ink-500">
                    الدورات والشهادات المتخصصة المعتمدة تدعم التطوير المستمر خارج السجل الدراسي.
                  </p>

                  {profile.certifications.length > 0 && (
                    <ul className="mb-4 flex flex-wrap gap-2">
                      {profile.certifications.map((cert) => (
                        <DeleteChip key={cert.id} action={deleteCertificationAction} id={cert.id}>
                          {cert.title}
                        </DeleteChip>
                      ))}
                    </ul>
                  )}

                  <AddCertificationForm />
                </section>

                <section className="border-t border-ink-100 pt-6">
                  <h3 className="mb-1 flex items-center gap-2 text-[13.5px] font-bold text-ink-900">
                    <Lightbulb className="size-4 text-navy-500" />
                    المشاريع والإنجازات المميّزة
                  </h3>
                  <p className="mb-3 text-[12px] text-ink-500">
                    الأعمال الريادية ومشاريع التخرّج والجوائز التي حققت أثراً ملموساً.
                  </p>

                  {profile.projects.length > 0 && (
                    <ul className="mb-4 flex flex-wrap gap-2">
                      {profile.projects.map((project) => (
                        <DeleteChip key={project.id} action={deleteProjectAction} id={project.id}>
                          {project.title}
                        </DeleteChip>
                      ))}
                    </ul>
                  )}

                  <AddProjectForm />
                </section>
              </div>
            )}

            {/* ---------------- الخطوة 5 ---------------- */}
            {step === 5 && (
              <div className="space-y-6">
                <p className="text-[12.5px] leading-relaxed text-ink-500">
                  راجع ملخّص بياناتك قبل إرسالها إلى خبير أكاديمي مختص لمراجعتها وصياغتها يدوياً
                  بلغة المنح الأكاديمية.
                </p>

                {/* --- جاهزية الملف --- */}
                <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
                  <h3 className="mb-3 text-[13px] font-bold text-ink-900">جاهزية الملف للإرسال</h3>
                  <ul className="space-y-2">
                    {readiness.map((item) => (
                      <li
                        key={item.label}
                        className={
                          item.done
                            ? "flex items-center gap-2 text-[12.5px] text-[color:var(--color-success)]"
                            : "flex items-center gap-2 text-[12.5px] text-ink-500"
                        }
                      >
                        {item.done ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <CircleAlert className="size-4 text-warning" />
                        )}
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* --- معاينة السيرة --- */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink-900">
                    <Eye className="size-4 text-navy-500" />
                    معاينة البيانات المُحالة للخبير
                  </h3>

                  <div className="overflow-hidden rounded-xl border border-ink-200">
                    <div className="bg-navy-700 p-5 text-white">
                      <p className="font-display text-lg font-extrabold">
                        {profile.fullNameAr ?? "—"}
                      </p>
                      {profile.fullNameEn && (
                        <p className="text-[12px] text-navy-100" dir="ltr">
                          {profile.fullNameEn}
                        </p>
                      )}
                      <p className="mt-2 text-[11.5px] text-navy-100" dir="ltr">
                        {profile.academicEmail ?? account.email}
                        {account.phone ? ` · ${account.phone}` : ""}
                      </p>
                      {(profile.country || profile.city) && (
                        <p className="text-[11.5px] text-navy-200">
                          {[profile.city, profile.country].filter(Boolean).join("، ")}
                        </p>
                      )}
                    </div>

                    <div className="space-y-5 bg-white p-5">
                      {profile.bio && (
                        <PreviewSection title="النبذة الأكاديمية">
                          <p className="text-[12.5px] leading-relaxed text-ink-600">{profile.bio}</p>
                        </PreviewSection>
                      )}

                      {profile.educations.length > 0 && (
                        <PreviewSection title="التعليم والمؤهلات">
                          <ul className="space-y-2">
                            {profile.educations.map((edu) => (
                              <li key={edu.id} className="text-[12.5px] text-ink-600">
                                <span className="font-bold text-ink-900">
                                  {DEGREE_LABELS[edu.degree]}
                                  {edu.major ? ` — ${edu.major}` : ""}
                                </span>
                                <br />
                                {edu.institution}
                                {edu.graduationYear && (
                                  <span className="num"> · {edu.graduationYear}</span>
                                )}
                                {edu.gpaValue != null && (
                                  <span className="num">
                                    {" "}
                                    · {formatGpa(edu.gpaValue, edu.gpaScale)}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </PreviewSection>
                      )}

                      {profile.experiences.length > 0 && (
                        <PreviewSection title="الخبرات والأنشطة">
                          <ul className="space-y-2">
                            {profile.experiences.map((exp) => (
                              <li key={exp.id} className="text-[12.5px] text-ink-600">
                                <span className="font-bold text-ink-900">{exp.title}</span> —{" "}
                                {exp.organization}
                              </li>
                            ))}
                          </ul>
                        </PreviewSection>
                      )}

                      {profile.skills.length > 0 && (
                        <PreviewSection title="المهارات">
                          <p className="text-[12.5px] text-ink-600">
                            {profile.skills.map((s) => s.name).join(" · ")}
                          </p>
                        </PreviewSection>
                      )}

                      {profile.languages.length > 0 && (
                        <PreviewSection title="اللغات والشهادات الدولية">
                          <p className="text-[12.5px] text-ink-600">
                            {profile.languages
                              .map(
                                (l) =>
                                  `${l.name} (${l.proficiency}${l.certificate ? ` — ${l.certificate}` : ""})`,
                              )
                              .join(" · ")}
                          </p>
                        </PreviewSection>
                      )}
                    </div>
                  </div>
                </div>

                {!ready && (
                  <Alert tone="warning">
                    أكمل العناصر الناقصة أعلاه للحصول على أفضل نتيجة — العناصر الإلزامية هي
                    المعلومات الشخصية والمؤهل الدراسي.
                  </Alert>
                )}

                <SubmitOrderForm
                  disabled={!profile.fullNameAr || !profile.bio || profile.educations.length === 0}
                />
              </div>
            )}
          </CardBody>
        </Card>

        <TipBox>{TIPS[step]}</TipBox>

        {/* --- التنقّل بين الخطوات --- */}
        <nav className="flex items-center justify-between gap-3">
          {step > 1 ? (
            <ButtonLink href={hrefFor(step - 1)} variant="outline">
              <ArrowRight className="size-4" />
              السابق: {STEPS[step - 2]!.label}
            </ButtonLink>
          ) : (
            <Link href="/tools" className="text-[13px] font-semibold text-ink-500 hover:text-navy-700">
              العودة للأدوات
            </Link>
          )}

          <span className="num text-[12px] text-ink-400">الخطوة {step} من 5</span>

          {step < 5 && (
            <ButtonLink href={hrefFor(step + 1)}>
              التالي: {STEPS[step]!.label}
              <ArrowLeft className="size-4" />
            </ButtonLink>
          )}
        </nav>
      </div>
    </div>
  );
}

function StepIcon({ step }: { step: number }) {
  const Cmp = [UserRound, GraduationCap, Briefcase, Sparkles, Eye][step - 1] ?? UserRound;
  return <Cmp className="size-4" />;
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 border-b border-ink-200 pb-1 text-[12px] font-extrabold text-navy-700">
        {title}
      </h4>
      {children}
    </section>
  );
}
