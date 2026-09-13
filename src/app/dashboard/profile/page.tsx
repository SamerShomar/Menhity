import type { Metadata } from "next";
import {
  Award,
  Briefcase,
  GraduationCap,
  Heart,
  Languages,
  Lightbulb,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getOrCreateProfile } from "@/lib/student-data";
import { computeCompletion } from "@/lib/profile-completion";
import { prisma } from "@/lib/prisma";
import {
  deleteCertificationAction,
  deleteEducationAction,
  deleteExperienceAction,
  deleteProjectAction,
  removeInterestAction,
  removeLanguageAction,
  removeSkillAction,
} from "@/app/actions/profile";
import {
  DEGREE_LABELS,
  EXPERIENCE_TYPE_LABELS,
  SKILL_SUGGESTIONS,
} from "@/lib/constants";
import { formatGpa, formatMonthYearAr } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AddCertificationForm,
  AddEducationForm,
  AddExperienceForm,
  AddLanguageForm,
  AddProjectForm,
  InterestAdder,
  PersonalInfoForm,
  SkillAdder,
} from "@/components/dashboard/profile-forms";

export const metadata: Metadata = { title: "الملف الأكاديمي" };

function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

/** زر حذف صغير يرسل الأكشن المناسب */
function DeleteButton({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label={label}
        className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 className="size-3.5" />
      </button>
    </form>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);
  const { percent } = computeCompletion(profile);

  const account = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { phone: true, email: true },
  });

  const existingSkills = new Set(profile.skills.map((s) => s.name));
  const skillSuggestions = SKILL_SUGGESTIONS.filter((s) => !existingSkills.has(s)).slice(0, 4);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">الملف الأكاديمي</h1>
        <p className="mt-2 text-[13.5px] text-ink-500">
          إدارة معلوماتك الشخصية وتعليمك ومهاراتك — هذه البيانات هي المصدر الذي تعتمد عليه
          المطابقة وأدوات الذكاء الاصطناعي.
        </p>
      </header>

      {/* --- شريط الاكتمال --- */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[15px] font-bold text-ink-900">إكمال الملف الشخصي</h2>
            <Badge tone={percent >= 80 ? "success" : "warning"}>
              <span className="num">{percent}%</span> مكتمل
            </Badge>
          </div>
          <Progress value={percent} className="mt-3.5" />
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-ink-500">
            <Lightbulb className="size-3.5 text-gold-500" />
            أكمل ملفك لزيادة فرص قبولك بنسبة <span className="num font-bold">40%</span>
          </p>
        </CardBody>
      </Card>

      {/* --- المعلومات الشخصية --- */}
      <Card>
        <CardHeader title="المعلومات الشخصية" icon={<UserRound className="size-4" />} />
        <CardBody className="pt-4">
          <PersonalInfoForm
            defaults={{
              fullNameAr: profile.fullNameAr ?? "",
              fullNameEn: profile.fullNameEn ?? "",
              academicEmail: profile.academicEmail ?? account.email,
              phone: account.phone ?? "",
              birthDate: toDateInput(profile.birthDate),
              nationality: profile.nationality ?? "",
              gender: profile.gender ?? "",
              country: profile.country ?? "",
              city: profile.city ?? "",
              linkedinUrl: profile.linkedinUrl ?? "",
              portfolioUrl: profile.portfolioUrl ?? "",
              bio: profile.bio ?? "",
            }}
          />
        </CardBody>
      </Card>

      {/* --- التعليم --- */}
      <Card>
        <CardHeader title="التعليم" icon={<GraduationCap className="size-4" />} />
        <CardBody className="pt-3">
          {profile.educations.length > 0 && (
            <ul className="mb-4 divide-y divide-ink-100">
              {profile.educations.map((edu) => (
                <li key={edu.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                      <GraduationCap className="size-4" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-ink-900">
                        {DEGREE_LABELS[edu.degree]}
                        {edu.major ? ` — ${edu.major}` : ""}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-500">
                        {edu.institution}
                        {edu.country ? ` · ${edu.country}` : ""}
                      </p>
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
                        {edu.honors && <Badge tone="success">{edu.honors}</Badge>}
                      </div>
                    </div>
                  </div>
                  <DeleteButton action={deleteEducationAction} id={edu.id} label="حذف المؤهل" />
                </li>
              ))}
            </ul>
          )}
          <AddEducationForm />
        </CardBody>
      </Card>

      {/* --- الخبرات --- */}
      <Card>
        <CardHeader
          title="الخبرات المهنية والأنشطة البحثية"
          icon={<Briefcase className="size-4" />}
        />
        <CardBody className="pt-3">
          {profile.experiences.length > 0 && (
            <ul className="mb-4 divide-y divide-ink-100">
              {profile.experiences.map((exp) => (
                <li key={exp.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                      <Briefcase className="size-4" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-bold text-ink-900">{exp.title}</p>
                      <p className="mt-0.5 text-[12px] text-ink-500">
                        {exp.organization}
                        {exp.city ? ` · ${exp.city}` : ""}
                        {exp.country ? `، ${exp.country}` : ""}
                      </p>
                      <p className="num mt-1 text-[11.5px] text-ink-400">
                        {formatMonthYearAr(exp.startDate)} —{" "}
                        {exp.isCurrent ? "حتى الآن" : formatMonthYearAr(exp.endDate)}
                      </p>
                      <div className="mt-1.5">
                        <Badge tone="neutral">{EXPERIENCE_TYPE_LABELS[exp.type]}</Badge>
                      </div>
                      {exp.description && (
                        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-ink-500">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <DeleteButton action={deleteExperienceAction} id={exp.id} label="حذف الخبرة" />
                </li>
              ))}
            </ul>
          )}
          <AddExperienceForm />
        </CardBody>
      </Card>

      {/* --- المهارات والاهتمامات --- */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="المهارات التقنية والشخصية" icon={<Sparkles className="size-4" />} />
          <CardBody className="pt-3">
            {profile.skills.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <li
                    key={skill.id}
                    className="flex items-center gap-1 rounded-full border border-ink-200 bg-ink-50 py-1 pe-1 ps-3 text-[12px] font-semibold text-ink-700"
                  >
                    {skill.name}
                    <DeleteButton
                      action={removeSkillAction}
                      id={skill.id}
                      label={`حذف ${skill.name}`}
                    />
                  </li>
                ))}
              </ul>
            )}
            <SkillAdder suggestions={skillSuggestions} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="مجالات الاهتمام" icon={<Heart className="size-4" />} />
          <CardBody className="pt-3">
            {profile.interests.length > 0 && (
              <ul className="mb-4 flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <li
                    key={interest.id}
                    className="flex items-center gap-1 rounded-full border border-gold-200 bg-gold-50 py-1 pe-1 ps-3 text-[12px] font-semibold text-gold-800"
                  >
                    {interest.name}
                    <DeleteButton
                      action={removeInterestAction}
                      id={interest.id}
                      label={`حذف ${interest.name}`}
                    />
                  </li>
                ))}
              </ul>
            )}
            <InterestAdder />
          </CardBody>
        </Card>
      </div>

      {/* --- اللغات --- */}
      <Card>
        <CardHeader title="اللغات" icon={<Languages className="size-4" />} />
        <CardBody className="pt-3">
          {profile.languages.length > 0 && (
            <ul className="mb-4 grid gap-2.5 sm:grid-cols-2">
              {profile.languages.map((lang) => (
                <li
                  key={lang.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50 px-3.5 py-3"
                >
                  <div>
                    <p className="text-[13px] font-bold text-ink-900">{lang.name}</p>
                    <p className="mt-0.5 text-[11.5px] text-ink-500">
                      {lang.proficiency}
                      {lang.certificate ? ` · ${lang.certificate}` : ""}
                    </p>
                  </div>
                  <DeleteButton
                    action={removeLanguageAction}
                    id={lang.id}
                    label={`حذف ${lang.name}`}
                  />
                </li>
              ))}
            </ul>
          )}
          <AddLanguageForm />
        </CardBody>
      </Card>

      {/* --- الشهادات --- */}
      <Card>
        <CardHeader title="الشهادات والاعتمادات" icon={<Award className="size-4" />} />
        <CardBody className="pt-3">
          {profile.certifications.length > 0 && (
            <ul className="mb-4 divide-y divide-ink-100">
              {profile.certifications.map((cert) => (
                <li key={cert.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <Award className="size-4 shrink-0 text-gold-600" />
                    <div>
                      <p className="text-[13px] font-bold text-ink-900">{cert.title}</p>
                      <p className="mt-0.5 text-[11.5px] text-ink-400">
                        {cert.issuer ?? "—"}
                        {cert.credentialId ? ` · رقم الاعتماد: ${cert.credentialId}` : ""}
                      </p>
                    </div>
                  </div>
                  <DeleteButton
                    action={deleteCertificationAction}
                    id={cert.id}
                    label="حذف الشهادة"
                  />
                </li>
              ))}
            </ul>
          )}
          <AddCertificationForm />
        </CardBody>
      </Card>

      {/* --- المشاريع --- */}
      <Card>
        <CardHeader title="المشاريع والإنجازات المميّزة" icon={<Lightbulb className="size-4" />} />
        <CardBody className="pt-3">
          {profile.projects.length > 0 && (
            <ul className="mb-4 divide-y divide-ink-100">
              {profile.projects.map((project) => (
                <li key={project.id} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-[13px] font-bold text-ink-900">
                      {project.title}
                      {project.year && <span className="num text-ink-400"> · {project.year}</span>}
                    </p>
                    {project.description && (
                      <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-ink-500">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <DeleteButton action={deleteProjectAction} id={project.id} label="حذف المشروع" />
                </li>
              ))}
            </ul>
          )}
          <AddProjectForm />
        </CardBody>
      </Card>
    </div>
  );
}
