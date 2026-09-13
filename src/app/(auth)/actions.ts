"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  createSession,
  generateVerificationCode,
  hashPassword,
  hashToken,
  verifyPassword,
} from "@/lib/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyCodeSchema,
} from "@/lib/validators";
import { fail, succeed, zodErrors, type FormState } from "@/lib/form-state";

/* ------------------------------------------------------------
   إنشاء حساب
   ------------------------------------------------------------ */

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { fullName, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("هذا البريد الإلكتروني مسجّل مسبقاً.", {
      email: "يوجد حساب بهذا البريد — جرّب تسجيل الدخول.",
    });
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash: await hashPassword(password),
      acceptedTermsAt: new Date(),
      profile: {
        create: { fullNameAr: fullName },
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SYSTEM",
      title: "أهلاً بك في منحتي 👋",
      body: "أكمل ملفك الأكاديمي لنبدأ باقتراح المنح الأنسب لك.",
      actionLabel: "إكمال الملف",
      actionUrl: "/dashboard/profile",
      badgeLabel: "جديد",
    },
  });

  await createSession(user.id, user.role);
  redirect("/dashboard");
}

/* ------------------------------------------------------------
   تسجيل الدخول
   ------------------------------------------------------------ */

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    remember: formData.get("remember") === "on",
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const next = String(formData.get("next") ?? "") || "/dashboard";
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // رسالة موحّدة حتى لا نكشف وجود الحساب من عدمه
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return fail("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  }

  if (user.status === "SUSPENDED") {
    return fail(
      user.suspensionReason
        ? `تم إيقاف هذا الحساب. السبب: ${user.suspensionReason}`
        : "تم إيقاف هذا الحساب. تواصل مع الدعم لمزيد من التفاصيل.",
    );
  }

  await createSession(user.id, user.role);
  redirect(next.startsWith("/") ? next : "/dashboard");
}

/* ------------------------------------------------------------
   استعادة كلمة المرور
   ------------------------------------------------------------ */

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return fail("تحقّق من صيغة البريد الإلكتروني.", zodErrors(parsed.error));
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // ننشئ الرمز فقط إذا وُجد الحساب، لكن الرسالة موحّدة في الحالتين
  if (user) {
    const code = generateVerificationCode();

    await prisma.verificationCode.updateMany({
      where: { userId: user.id, type: "PASSWORD_RESET", usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        type: "PASSWORD_RESET",
        codeHash: hashToken(code),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 دقيقة
      },
    });

    // في بيئة التطوير يُطبع الرمز في السجل بدل إرسال بريد فعلي
    if (process.env.NODE_ENV !== "production") {
      console.info(`[منحتي] رمز استعادة كلمة المرور لـ ${email}: ${code}`);
    }
  }

  redirect(`/verify?email=${encodeURIComponent(email)}`);
}

/* ------------------------------------------------------------
   التحقق من الرمز
   ------------------------------------------------------------ */

export async function verifyCodeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = verifyCodeSchema.safeParse({
    email: formData.get("email"),
    code: String(formData.get("code") ?? "").trim(),
  });

  if (!parsed.success) {
    return fail("الرمز غير صحيح.", zodErrors(parsed.error));
  }

  const { email, code } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail("الرمز غير صحيح أو منتهي الصلاحية.");

  const record = await prisma.verificationCode.findFirst({
    where: { userId: user.id, type: "PASSWORD_RESET", usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return fail("انتهت صلاحية الرمز. اطلب رمزاً جديداً.");
  }

  if (record.attempts >= 5) {
    return fail("تجاوزت عدد المحاولات المسموح بها. اطلب رمزاً جديداً.");
  }

  if (record.codeHash !== hashToken(code)) {
    await prisma.verificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return fail("الرمز غير صحيح. تحقّق من بريدك وحاول مجدداً.");
  }

  redirect(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
}

/** إعادة إرسال الرمز */
export async function resendCodeAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return fail("البريد الإلكتروني مفقود.");

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const code = generateVerificationCode();

    await prisma.verificationCode.updateMany({
      where: { userId: user.id, type: "PASSWORD_RESET", usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        type: "PASSWORD_RESET",
        codeHash: hashToken(code),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    if (process.env.NODE_ENV !== "production") {
      console.info(`[منحتي] رمز جديد لـ ${email}: ${code}`);
    }
  }

  return succeed("تم إرسال رمز جديد إلى بريدك الإلكتروني.");
}

/* ------------------------------------------------------------
   تعيين كلمة مرور جديدة
   ------------------------------------------------------------ */

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const { email, code, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return fail("تعذّر إتمام العملية. اطلب رمزاً جديداً.");

  const record = await prisma.verificationCode.findFirst({
    where: { userId: user.id, type: "PASSWORD_RESET", usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date() || record.codeHash !== hashToken(code)) {
    return fail("انتهت صلاحية الرمز أو أنه غير صحيح. اطلب رمزاً جديداً.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(password) },
    }),
    prisma.verificationCode.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // إنهاء كل الجلسات السابقة بعد تغيير كلمة المرور
    prisma.session.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  redirect("/reset-password/success");
}
