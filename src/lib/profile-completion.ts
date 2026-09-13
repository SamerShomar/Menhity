import type { Prisma } from "@prisma/client";

/**
 * حساب نسبة اكتمال الملف الشخصي.
 * الأقسام مطابقة للتشيك ليست المعروضة في شاشة "نظرة عامة".
 */

export type ProfileForCompletion = Prisma.StudentProfileGetPayload<{
  include: {
    educations: true;
    experiences: true;
    skills: true;
    languages: true;
    certifications: true;
    projects: true;
    interests: true;
  };
}>;

export type CompletionSection = {
  key: string;
  label: string;
  done: boolean;
  weight: number;
  hint: string;
};

export function computeCompletion(profile: ProfileForCompletion | null): {
  percent: number;
  sections: CompletionSection[];
} {
  const p = profile;

  const sections: CompletionSection[] = [
    {
      key: "personal",
      label: "المعلومات الشخصية",
      weight: 25,
      done: Boolean(p?.fullNameAr && p?.country && p?.bio),
      hint: "أضف اسمك الكامل، بلدك، ونبذة مختصرة عنك.",
    },
    {
      key: "education",
      label: "التعليم",
      weight: 25,
      done: (p?.educations.length ?? 0) > 0,
      hint: "أضف مؤهلك الدراسي الحالي أو الأحدث.",
    },
    {
      key: "major",
      label: "التخصص",
      weight: 15,
      done: Boolean(p?.educations.some((e) => e.major)),
      hint: "حدّد تخصصك الأكاديمي لتحسين دقة المطابقة.",
    },
    {
      key: "skills",
      label: "المهارات",
      weight: 15,
      done: (p?.skills.length ?? 0) >= 3,
      hint: "أضف 3 مهارات على الأقل.",
    },
    {
      key: "languages",
      label: "اللغات",
      weight: 10,
      done: (p?.languages.length ?? 0) > 0,
      hint: "أضف اللغات التي تتقنها ومستوى إتقانك.",
    },
    {
      key: "interests",
      label: "الاهتمامات",
      weight: 10,
      done: (p?.interests.length ?? 0) > 0,
      hint: "أضف مجالات اهتمامك لنقترح عليك منحاً أنسب.",
    },
  ];

  const percent = sections.reduce((sum, s) => sum + (s.done ? s.weight : 0), 0);

  return { percent, sections };
}
