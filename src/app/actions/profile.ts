"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile, refreshCompletion } from "@/lib/student-data";
import {
  certificationSchema,
  educationSchema,
  experienceSchema,
  languageSchema,
  personalInfoSchema,
  projectSchema,
} from "@/lib/validators";
import { fail, succeed, zodErrors, type FormState } from "@/lib/form-state";

function refresh() {
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/tools/cv-builder");
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** يتحقّق أن العنصر يخصّ المستخدم الحالي قبل التعديل أو الحذف */
async function assertOwnProfile(profileId: string, userId: string): Promise<boolean> {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  return profile?.userId === userId;
}

/* ============================================================
   المعلومات الشخصية
   ============================================================ */

export async function updatePersonalInfoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = personalInfoSchema.safeParse({
    fullNameAr: formData.get("fullNameAr"),
    fullNameEn: formData.get("fullNameEn"),
    academicEmail: formData.get("academicEmail"),
    phone: formData.get("phone"),
    birthDate: formData.get("birthDate"),
    nationality: formData.get("nationality"),
    gender: formData.get("gender") || undefined,
    country: formData.get("country"),
    city: formData.get("city"),
    linkedinUrl: formData.get("linkedinUrl"),
    portfolioUrl: formData.get("portfolioUrl"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { phone, birthDate, ...profileData } = parsed.data;
  const profile = await getOrCreateProfile(user.id);

  await prisma.studentProfile.update({
    where: { id: profile.id },
    data: { ...profileData, birthDate: parseDate(birthDate) ?? null },
  });

  if (phone !== undefined) {
    await prisma.user.update({ where: { id: user.id }, data: { phone } });
  }

  await refreshCompletion(user.id);
  refresh();

  return succeed("تم حفظ المعلومات الشخصية.");
}

/* ============================================================
   التعليم
   ============================================================ */

export async function saveEducationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = educationSchema.safeParse({
    ...raw,
    graduationYear: raw.graduationYear || undefined,
    gpaValue: raw.gpaValue || undefined,
    gpaScale: raw.gpaScale || undefined,
    isCurrent: formData.get("isCurrent") === "on",
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { id, ...data } = parsed.data;

  if (id) {
    const existing = await prisma.education.findFirst({
      where: { id, profileId: profile.id },
    });
    if (!existing) return fail("العنصر غير موجود.");
    await prisma.education.update({ where: { id }, data });
  } else {
    const count = await prisma.education.count({ where: { profileId: profile.id } });
    await prisma.education.create({
      data: { ...data, profileId: profile.id, sortOrder: count },
    });
  }

  await refreshCompletion(user.id);
  refresh();

  return succeed(id ? "تم تحديث المؤهل." : "تمت إضافة المؤهل.");
}

export async function deleteEducationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.education.findUnique({ where: { id }, select: { profileId: true } });
  if (!item || !(await assertOwnProfile(item.profileId, user.id))) return;

  await prisma.education.delete({ where: { id } });
  await refreshCompletion(user.id);
  refresh();
}

/* ============================================================
   الخبرات
   ============================================================ */

export async function saveExperienceAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = experienceSchema.safeParse({
    ...raw,
    isCurrent: formData.get("isCurrent") === "on",
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { id, startDate, endDate, ...data } = parsed.data;
  const dates = {
    startDate: parseDate(startDate) ?? null,
    endDate: data.isCurrent ? null : (parseDate(endDate) ?? null),
  };

  if (id) {
    const existing = await prisma.experience.findFirst({ where: { id, profileId: profile.id } });
    if (!existing) return fail("العنصر غير موجود.");
    await prisma.experience.update({ where: { id }, data: { ...data, ...dates } });
  } else {
    const count = await prisma.experience.count({ where: { profileId: profile.id } });
    await prisma.experience.create({
      data: { ...data, ...dates, profileId: profile.id, sortOrder: count },
    });
  }

  await refreshCompletion(user.id);
  refresh();

  return succeed(id ? "تم تحديث الخبرة." : "تمت إضافة الخبرة.");
}

export async function deleteExperienceAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.experience.findUnique({ where: { id }, select: { profileId: true } });
  if (!item || !(await assertOwnProfile(item.profileId, user.id))) return;

  await prisma.experience.delete({ where: { id } });
  await refreshCompletion(user.id);
  refresh();
}

/* ============================================================
   المهارات والاهتمامات (قوائم بسيطة)
   ============================================================ */

export async function addSkillAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.profileSkill
    .create({ data: { profileId: profile.id, name } })
    .catch(() => undefined); // مهارة مكرّرة — نتجاهل

  await refreshCompletion(user.id);
  refresh();
}

export async function removeSkillAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.profileSkill.findUnique({ where: { id }, select: { profileId: true } });
  if (!item || !(await assertOwnProfile(item.profileId, user.id))) return;

  await prisma.profileSkill.delete({ where: { id } });
  await refreshCompletion(user.id);
  refresh();
}

export async function addInterestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.interest
    .create({ data: { profileId: profile.id, name } })
    .catch(() => undefined);

  await refreshCompletion(user.id);
  refresh();
}

export async function removeInterestAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.interest.findUnique({ where: { id }, select: { profileId: true } });
  if (!item || !(await assertOwnProfile(item.profileId, user.id))) return;

  await prisma.interest.delete({ where: { id } });
  await refreshCompletion(user.id);
  refresh();
}

/* ============================================================
   اللغات
   ============================================================ */

export async function saveLanguageAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  const parsed = languageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { id, ...data } = parsed.data;

  if (id) {
    const existing = await prisma.profileLanguage.findFirst({ where: { id, profileId: profile.id } });
    if (!existing) return fail("العنصر غير موجود.");
    await prisma.profileLanguage.update({ where: { id }, data });
  } else {
    const duplicate = await prisma.profileLanguage.findFirst({
      where: { profileId: profile.id, name: data.name },
    });
    if (duplicate) return fail("هذه اللغة مضافة مسبقاً.");
    await prisma.profileLanguage.create({ data: { ...data, profileId: profile.id } });
  }

  await refreshCompletion(user.id);
  refresh();

  return succeed("تم حفظ اللغة.");
}

export async function removeLanguageAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.profileLanguage.findUnique({
    where: { id },
    select: { profileId: true },
  });
  if (!item || !(await assertOwnProfile(item.profileId, user.id))) return;

  await prisma.profileLanguage.delete({ where: { id } });
  await refreshCompletion(user.id);
  refresh();
}

/* ============================================================
   الشهادات والمشاريع
   ============================================================ */

export async function saveCertificationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  const parsed = certificationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { id, issueDate, ...data } = parsed.data;
  const payload = { ...data, issueDate: parseDate(issueDate) ?? null };

  if (id) {
    const existing = await prisma.certification.findFirst({ where: { id, profileId: profile.id } });
    if (!existing) return fail("العنصر غير موجود.");
    await prisma.certification.update({ where: { id }, data: payload });
  } else {
    await prisma.certification.create({ data: { ...payload, profileId: profile.id } });
  }

  refresh();
  return succeed("تم حفظ الشهادة.");
}

export async function deleteCertificationAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.certification.findUnique({
    where: { id },
    select: { profileId: true },
  });
  if (!item || !(await assertOwnProfile(item.profileId, user.id))) return;

  await prisma.certification.delete({ where: { id } });
  refresh();
}

export async function saveProjectAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = projectSchema.safeParse({ ...raw, year: raw.year || undefined });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { id, ...data } = parsed.data;

  if (id) {
    const existing = await prisma.project.findFirst({ where: { id, profileId: profile.id } });
    if (!existing) return fail("العنصر غير موجود.");
    await prisma.project.update({ where: { id }, data });
  } else {
    await prisma.project.create({ data: { ...data, profileId: profile.id } });
  }

  refresh();
  return succeed("تم حفظ المشروع.");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const item = await prisma.project.findUnique({ where: { id }, select: { profileId: true } });
  if (!item || !(await assertOwnProfile(item.profileId, user.id))) return;

  await prisma.project.delete({ where: { id } });
  refresh();
}
