"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  changePasswordSchema,
  localeSettingsSchema,
  notificationSettingsSchema,
  privacySettingsSchema,
} from "@/lib/validators";
import { fail, succeed, zodErrors, type FormState } from "@/lib/form-state";

/* ---------- تغيير كلمة المرور ---------- */

export async function changePasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const record = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!record.passwordHash || !(await verifyPassword(parsed.data.currentPassword, record.passwordHash))) {
    return fail("كلمة المرور الحالية غير صحيحة.", {
      currentPassword: "كلمة المرور الحالية غير صحيحة.",
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  // إنهاء بقية الجلسات مع إبقاء الجلسة الحالية
  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null, id: { not: user.sessionId } },
    data: { revokedAt: new Date() },
  });

  revalidatePath("/dashboard/settings");
  return succeed("تم تحديث كلمة المرور، وتم إنهاء جلساتك على الأجهزة الأخرى.");
}

/* ---------- الخصوصية ---------- */

export async function updatePrivacyAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = privacySettingsSchema.safeParse({
    profileVisible: formData.get("profileVisible") === "on",
    shareDataWithUniversities: formData.get("shareDataWithUniversities") === "on",
  });

  if (!parsed.success) return fail("تعذّر حفظ الإعدادات.");

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });

  revalidatePath("/dashboard/settings");
  return succeed("تم حفظ إعدادات الخصوصية.");
}

/* ---------- تنبيهات البريد ---------- */

export async function updateNotificationsAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = notificationSettingsSchema.safeParse({
    notifyNewMatches: formData.get("notifyNewMatches") === "on",
    notifyApplicationStatus: formData.get("notifyApplicationStatus") === "on",
    notifyNews: formData.get("notifyNews") === "on",
  });

  if (!parsed.success) return fail("تعذّر حفظ الإعدادات.");

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });

  revalidatePath("/dashboard/settings");
  return succeed("تم حفظ تفضيلات التنبيهات.");
}

/* ---------- اللغة والمنطقة ---------- */

export async function updateLocaleAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = localeSettingsSchema.safeParse({
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) return fail("تعذّر حفظ الإعدادات.", zodErrors(parsed.error));

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });

  revalidatePath("/dashboard/settings");
  return succeed("تم حفظ التغييرات.");
}

/* ---------- الجلسات والأجهزة ---------- */

export async function revokeSessionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.session.updateMany({
    where: { id, userId: user.id },
    data: { revokedAt: new Date() },
  });

  // إنهاء الجلسة الحالية يعني تسجيل خروج فوري
  if (id === user.sessionId) {
    await destroySession();
    redirect("/login");
  }

  revalidatePath("/dashboard/settings");
}

export async function revokeAllSessionsAction(): Promise<void> {
  const user = await requireUser();

  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await destroySession();
  redirect("/login");
}

/* ---------- منطقة الخطر ---------- */

export async function deactivateAccountAction(): Promise<void> {
  const user = await requireUser();

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "INACTIVE" },
  });

  await prisma.session.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await destroySession();
  redirect("/login?deactivated=1");
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  // تأكيد نصّي إلزامي قبل الحذف النهائي
  if (String(formData.get("confirm") ?? "").trim() !== "حذف") return;

  await destroySession();
  await prisma.user.delete({ where: { id: user.id } });

  redirect("/?deleted=1");
}
