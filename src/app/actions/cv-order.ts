"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateProfile } from "@/lib/student-data";
import { computeAtsReport } from "@/lib/ai";
import { generateOrderNumber } from "@/lib/utils";
import { fail, succeed, type FormState } from "@/lib/form-state";

const TIMELINE_STEPS = [
  "استلام ومطابقة البيانات الأكاديمية والوثائق المدخلة",
  "المراجعة اليدوية وإعادة صياغة الإنجازات بلغة المنح الأكاديمية",
  "الفحص الدقيق لمعايير ATS والتنسيق الأكاديمي الدولي المعتمد",
  "تسليم النسخة النهائية واعتمادها للتنزيل المباشر",
];

/** إرسال طلب صياغة السيرة الذاتية إلى خبير أكاديمي */
export async function submitCvOrderAction(
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);

  // لا يمكن الإرسال بملف ناقص
  if (profile.educations.length === 0) {
    return fail("أضف مؤهلاً دراسياً واحداً على الأقل قبل إرسال الطلب.");
  }
  if (!profile.fullNameAr || !profile.bio) {
    return fail("أكمل المعلومات الشخصية (الاسم والنبذة) قبل إرسال الطلب.");
  }

  // طلب قيد المعالجة بالفعل؟
  const active = await prisma.cvOrder.findFirst({
    where: {
      userId: user.id,
      status: { in: ["SUBMITTED", "IN_EXPERT_REVIEW", "ATS_CHECK"] },
    },
  });

  if (active) {
    redirect(`/tools/cv-builder/orders/${active.id}`);
  }

  // إسناد الطلب لأقل الخبراء انشغالاً
  const experts = await prisma.user.findMany({
    where: { role: "EXPERT", status: "ACTIVE" },
    select: { id: true, _count: { select: { assignedCvOrders: true } } },
  });

  const expert = experts.sort(
    (a, b) => a._count.assignedCvOrders - b._count.assignedCvOrders,
  )[0];

  const ats = computeAtsReport({
    hasSummary: Boolean(profile.bio),
    educationCount: profile.educations.length,
    experienceCount: profile.experiences.length,
    skillCount: profile.skills.length,
    hasLanguageCertificate: profile.languages.some((l) => Boolean(l.certificate)),
    quantifiedAchievements: [...profile.experiences, ...profile.projects].some((item) =>
      /\d/.test(item.description ?? ""),
    ),
  });

  const order = await prisma.cvOrder.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: user.id,
      expertId: expert?.id ?? null,
      status: "IN_EXPERT_REVIEW",
      currentStep: 5,
      atsScore: ats.score,
      submittedAt: new Date(),
      // مهلة التسليم: 48 ساعة عمل
      expectedDeliveryAt: new Date(Date.now() + 48 * 3600_000),
      dataSnapshot: {
        fullNameAr: profile.fullNameAr,
        fullNameEn: profile.fullNameEn,
        bio: profile.bio,
        educations: profile.educations.length,
        experiences: profile.experiences.length,
        skills: profile.skills.map((s) => s.name),
        languages: profile.languages.map((l) => `${l.name} — ${l.proficiency}`),
      },
      timeline: {
        create: TIMELINE_STEPS.map((title, i) => ({
          title,
          sortOrder: i,
          status: i === 0 ? "DONE" : i === 1 ? "IN_PROGRESS" : "PENDING",
          occurredAt: i <= 1 ? new Date() : null,
        })),
      },
      atsChecks: {
        create: ats.checks.map((check, i) => ({
          label: check.label,
          passed: check.passed,
          sortOrder: i,
        })),
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "ORDER_UPDATE",
      title: "تم استلام طلب صياغة سيرتك الذاتية",
      body: `رقم الطلب ${order.orderNumber}. سيتواصل معك الخبير الأكاديمي خلال 24–48 ساعة عمل.`,
      badgeLabel: "قيد المراجعة",
      actionLabel: "متابعة الطلب",
      actionUrl: `/tools/cv-builder/orders/${order.id}`,
    },
  });

  redirect(`/tools/cv-builder/orders/${order.id}`);
}

/** إرسال ملاحظة خاصة إلى الخبير المعيّن */
export async function addOrderNoteAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const orderId = String(formData.get("orderId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!orderId || body.length < 3) {
    return fail("اكتب ملاحظتك أولاً.");
  }

  const order = await prisma.cvOrder.findFirst({
    where: { id: orderId, userId: user.id },
    select: { id: true },
  });

  if (!order) return fail("الطلب غير موجود.");

  await prisma.cvOrderNote.create({
    data: { orderId: order.id, authorId: user.id, body },
  });

  revalidatePath(`/tools/cv-builder/orders/${order.id}`);
  return succeed("تم إرسال ملاحظتك إلى الخبير.");
}
