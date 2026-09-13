import "server-only";

import { prisma } from "@/lib/prisma";
import { computeCompletion } from "@/lib/profile-completion";

const PROFILE_INCLUDE = {
  educations: { orderBy: { sortOrder: "asc" } },
  experiences: { orderBy: { sortOrder: "asc" } },
  skills: { orderBy: { name: "asc" } },
  languages: { orderBy: { name: "asc" } },
  certifications: { orderBy: { issueDate: "desc" } },
  projects: { orderBy: { year: "desc" } },
  interests: { orderBy: { name: "asc" } },
} as const;

/** يجلب الملف الأكاديمي وينشئه إن لم يكن موجوداً */
export async function getOrCreateProfile(userId: string) {
  const existing = await prisma.studentProfile.findUnique({
    where: { userId },
    include: PROFILE_INCLUDE,
  });

  if (existing) return existing;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { fullName: true },
  });

  await prisma.studentProfile.create({
    data: { userId, fullNameAr: user.fullName },
  });

  return prisma.studentProfile.findUniqueOrThrow({
    where: { userId },
    include: PROFILE_INCLUDE,
  });
}

/** يعيد حساب نسبة الاكتمال ويخزّنها */
export async function refreshCompletion(userId: string): Promise<number> {
  const profile = await getOrCreateProfile(userId);
  const { percent } = computeCompletion(profile);

  if (profile.completionPercent !== percent) {
    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { completionPercent: percent },
    });
  }

  return percent;
}
