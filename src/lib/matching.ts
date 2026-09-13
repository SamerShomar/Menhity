import type { DegreeLevel, Prisma } from "@prisma/client";
import { DEGREE_LABELS, FUNDING_LABELS } from "@/lib/constants";
import { gpaToPercent } from "@/lib/utils";

/**
 * خوارزمية المطابقة بين ملف الطالب والمنحة.
 * تُنتج نتيجة من 100 مع أسباب مقروءة تظهر تحت "لماذا تناسبني؟".
 */

export type MatchProfile = Prisma.StudentProfileGetPayload<{
  include: { educations: true; skills: true; languages: true; interests: true };
}>;

export type MatchScholarship = Prisma.ScholarshipGetPayload<{
  include: { levels: true; majors: true };
}>;

export type MatchResult = {
  score: number;
  reasons: string[];
};

/** ترتيب الدرجات لتحديد "الدرجة التالية" المتوقّعة للطالب */
const DEGREE_ORDER: DegreeLevel[] = ["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD"];

function nextDegree(current: DegreeLevel): DegreeLevel {
  const i = DEGREE_ORDER.indexOf(current);
  return DEGREE_ORDER[Math.min(i + 1, DEGREE_ORDER.length - 1)]!;
}

/** تطبيع النص العربي/الإنجليزي للمقارنة */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ً-ْ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function overlaps(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na.includes(nb) || nb.includes(na)) return true;

  const wordsA = new Set(na.split(" ").filter((w) => w.length > 2));
  const wordsB = nb.split(" ").filter((w) => w.length > 2);
  return wordsB.some((w) => wordsA.has(w));
}

const WEIGHTS = {
  level: 30,
  major: 25,
  gpa: 20,
  language: 15,
  interest: 10,
} as const;

export function computeMatch(
  profile: MatchProfile | null,
  scholarship: MatchScholarship,
): MatchResult {
  // بدون ملف أكاديمي لا يمكن حساب مطابقة ذات معنى
  if (!profile || profile.educations.length === 0) {
    return { score: 0, reasons: [] };
  }

  const reasons: string[] = [];
  let score = 0;

  const latest = [...profile.educations].sort(
    (a, b) => (b.graduationYear ?? 0) - (a.graduationYear ?? 0),
  )[0]!;

  /* --- 1) مستوى الدراسة --- */
  const target = nextDegree(latest.degree);
  const offeredLevels = scholarship.levels.map((l) => l.level);

  if (offeredLevels.includes(target)) {
    score += WEIGHTS.level;
    reasons.push(`المنحة متاحة لمستوى ${DEGREE_LABELS[target]}، وهو المستوى التالي في مسارك الأكاديمي.`);
  } else if (offeredLevels.includes(latest.degree)) {
    score += Math.round(WEIGHTS.level * 0.5);
    reasons.push(`المنحة متاحة لمستوى ${DEGREE_LABELS[latest.degree]} المطابق لمؤهلك الحالي.`);
  }

  /* --- 2) التخصص --- */
  const profileMajors = profile.educations.map((e) => e.major).filter(Boolean) as string[];
  const interests = profile.interests.map((i) => i.name);
  const skills = profile.skills.map((s) => s.name);
  const scholarshipMajors = scholarship.majors.map((m) => m.name);

  if (scholarshipMajors.length === 0) {
    // منحة مفتوحة لكل التخصصات
    score += Math.round(WEIGHTS.major * 0.7);
    reasons.push("المنحة مفتوحة لجميع التخصصات.");
  } else {
    const matchedMajor = scholarshipMajors.find((m) =>
      profileMajors.some((pm) => overlaps(pm, m)),
    );
    if (matchedMajor) {
      score += WEIGHTS.major;
      reasons.push(`تخصصك يتوافق مع مجال «${matchedMajor}» المطلوب في المنحة.`);
    } else {
      const matchedBySkill = scholarshipMajors.find((m) =>
        [...skills, ...interests].some((s) => overlaps(s, m)),
      );
      if (matchedBySkill) {
        score += Math.round(WEIGHTS.major * 0.6);
        reasons.push(`مهاراتك واهتماماتك قريبة من مجال «${matchedBySkill}».`);
      }
    }
  }

  /* --- 3) المعدل التراكمي --- */
  const studentGpa = gpaToPercent(latest.gpaValue, latest.gpaScale);
  const requiredGpa = gpaToPercent(scholarship.minGpa, scholarship.gpaScale);

  if (requiredGpa == null) {
    score += Math.round(WEIGHTS.gpa * 0.6);
  } else if (studentGpa != null) {
    if (studentGpa >= requiredGpa) {
      score += WEIGHTS.gpa;
      reasons.push("معدلك التراكمي يتجاوز الحد الأدنى المطلوب للمنحة.");
    } else if (studentGpa >= requiredGpa - 5) {
      score += Math.round(WEIGHTS.gpa * 0.4);
      reasons.push("معدلك قريب جداً من الحد الأدنى المطلوب.");
    }
  }

  /* --- 4) متطلبات اللغة --- */
  if (scholarship.languageRequirement === "NOT_REQUIRED") {
    score += WEIGHTS.language;
    reasons.push("لا تشترط هذه المنحة شهادة لغة، وهو ما يسهّل تقديمك.");
  } else {
    const hasCert = profile.languages.some(
      (l) => l.certificate && /ielts|toefl|أيلتس|توفل/i.test(l.certificate),
    );
    if (hasCert) {
      score += WEIGHTS.language;
      reasons.push("لديك شهادة لغة معتمدة تغطّي متطلبات المنحة.");
    }
  }

  /* --- 5) الاهتمام بالدولة / نوع التمويل --- */
  if (scholarship.fundingType === "FULL") {
    score += WEIGHTS.interest;
    reasons.push(`المنحة ${FUNDING_LABELS.FULL}، وتغطّي تكاليف الدراسة والمعيشة.`);
  } else {
    score += Math.round(WEIGHTS.interest * 0.5);
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons };
}

/** حساب المطابقة لمجموعة منح ثم ترتيبها تنازلياً */
export function rankScholarships(
  profile: MatchProfile | null,
  scholarships: MatchScholarship[],
): Array<{ scholarship: MatchScholarship } & MatchResult> {
  return scholarships
    .map((s) => ({ scholarship: s, ...computeMatch(profile, s) }))
    .sort((a, b) => b.score - a.score);
}
