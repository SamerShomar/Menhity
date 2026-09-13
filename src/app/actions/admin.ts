"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma, UserRole, UserStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scholarshipSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";
import { fail, succeed, zodErrors, type FormState } from "@/lib/form-state";

/** تسجيل الإجراءات الإدارية في سجل التدقيق */
async function audit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  meta?: Prisma.InputJsonValue,
) {
  await prisma.auditLog.create({
    data: { actorId, action, entityType, entityId, meta },
  });
}

function refreshScholarships(id?: string) {
  revalidatePath("/admin/scholarships");
  revalidatePath("/admin");
  revalidatePath("/scholarships");
  revalidatePath("/");
  if (id) revalidatePath(`/admin/scholarships/${id}`);
}

/** يحوّل قائمة نصية مفصولة بأسطر إلى مصفوفة */
function toLines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** "اسم المستند | ملاحظة" في كل سطر */
function toPairs(value: FormDataEntryValue | null): { name: string; note?: string }[] {
  return toLines(value).map((line) => {
    const [name, note] = line.split("|").map((p) => p.trim());
    return { name: name!, note: note || undefined };
  });
}

/** "العنوان | الوصف" في كل سطر */
function toBenefits(
  value: FormDataEntryValue | null,
): { title: string; description?: string }[] {
  return toLines(value).map((line) => {
    const [title, description] = line.split("|").map((p) => p.trim());
    return { title: title!, description: description || undefined };
  });
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ============================================================
   إنشاء وتعديل المنح
   ============================================================ */

export async function saveScholarshipAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireRole("ADMIN", "MODERATOR");

  const id = String(formData.get("id") ?? "");

  const parsed = scholarshipSchema.safeParse({
    titleAr: formData.get("titleAr"),
    titleEn: formData.get("titleEn"),
    provider: formData.get("provider"),
    universityName: formData.get("universityName"),
    countryCode: String(formData.get("countryCode") ?? "").toUpperCase(),
    countryNameAr: formData.get("countryNameAr"),
    region: formData.get("region"),
    fundingType: formData.get("fundingType"),
    languageRequirement: formData.get("languageRequirement"),
    status: formData.get("status"),
    description: formData.get("description"),
    applyUrl: formData.get("applyUrl"),
    openDate: formData.get("openDate"),
    deadline: formData.get("deadline"),
    minGpa: formData.get("minGpa") || undefined,
    gpaScale: formData.get("gpaScale") || undefined,
    acceptanceRate: formData.get("acceptanceRate") || undefined,
    isFeatured: formData.get("isFeatured") === "on",
    levels: formData.getAll("levels").map(String),
    majors: toLines(formData.get("majors")),
    eligibility: toLines(formData.get("eligibility")),
    documents: toPairs(formData.get("documents")),
    benefits: toBenefits(formData.get("benefits")),
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  const {
    levels,
    majors = [],
    eligibility = [],
    documents = [],
    benefits = [],
    openDate,
    deadline,
    ...data
  } = parsed.data;

  const scalars = {
    ...data,
    openDate: parseDate(openDate),
    deadline: parseDate(deadline),
    publishedAt: data.status === "PUBLISHED" ? new Date() : null,
  };

  const children = {
    levels: { create: levels.map((level) => ({ level })) },
    majors: { create: majors.map((name) => ({ name })) },
    eligibility: { create: eligibility.map((text, i) => ({ text, sortOrder: i })) },
    documents: { create: documents.map((d, i) => ({ ...d, sortOrder: i })) },
    benefits: { create: benefits.map((b, i) => ({ ...b, sortOrder: i })) },
  };

  let scholarshipId = id;

  if (id) {
    const existing = await prisma.scholarship.findUnique({ where: { id } });
    if (!existing) return fail("المنحة غير موجودة.");

    // نستبدل العناصر الفرعية بالكامل بدل محاولة المطابقة
    await prisma.$transaction([
      prisma.scholarshipLevel.deleteMany({ where: { scholarshipId: id } }),
      prisma.scholarshipMajor.deleteMany({ where: { scholarshipId: id } }),
      prisma.scholarshipEligibility.deleteMany({ where: { scholarshipId: id } }),
      prisma.scholarshipDocument.deleteMany({ where: { scholarshipId: id } }),
      prisma.scholarshipBenefit.deleteMany({ where: { scholarshipId: id } }),
      prisma.scholarship.update({
        where: { id },
        data: {
          ...scalars,
          publishedAt: existing.publishedAt ?? scalars.publishedAt,
          ...children,
        },
      }),
    ]);

    await audit(admin.id, "scholarship.update", "Scholarship", id, { titleAr: data.titleAr });
  } else {
    // نضمن تفرّد الـ slug
    const base = slugify(data.titleEn ?? data.titleAr);
    let slug = base;
    let n = 1;
    while (await prisma.scholarship.findUnique({ where: { slug } })) {
      slug = `${base}-${++n}`;
    }

    const created = await prisma.scholarship.create({
      data: { ...scalars, slug, createdById: admin.id, ...children },
    });

    scholarshipId = created.id;
    await audit(admin.id, "scholarship.create", "Scholarship", created.id, {
      titleAr: data.titleAr,
    });
  }

  refreshScholarships(scholarshipId);
  redirect("/admin/scholarships");
}

export async function setScholarshipStatusAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN", "MODERATOR");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  const valid = ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "EXPIRED", "ARCHIVED"];
  if (!id || !valid.includes(status)) return;

  await prisma.scholarship.update({
    where: { id },
    data: {
      status: status as never,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    },
  });

  await audit(admin.id, "scholarship.status", "Scholarship", id, { status });
  refreshScholarships(id);
}

export async function deleteScholarshipAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.scholarship.delete({ where: { id } });
  await audit(admin.id, "scholarship.delete", "Scholarship", id);

  refreshScholarships();
}

/* ============================================================
   المستخدمون
   ============================================================ */

export async function setUserStatusAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN", "MODERATOR");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as UserStatus;
  const reason = String(formData.get("reason") ?? "").trim();

  if (!id || !["ACTIVE", "INACTIVE", "SUSPENDED"].includes(status)) return;
  if (id === admin.id) return; // لا يوقف المدير حسابه بنفسه

  await prisma.user.update({
    where: { id },
    data: {
      status,
      suspendedAt: status === "SUSPENDED" ? new Date() : null,
      suspensionReason: status === "SUSPENDED" ? reason || "مخالفة سياسة الاستخدام" : null,
    },
  });

  // إيقاف الحساب ينهي كل جلساته
  if (status === "SUSPENDED") {
    await prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  await audit(admin.id, "user.status", "User", id, { status, reason });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

export async function setUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN");

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!id || !["STUDENT", "EXPERT", "MODERATOR", "ADMIN"].includes(role)) return;
  if (id === admin.id) return; // لا يغيّر المدير دوره بنفسه

  await prisma.user.update({ where: { id }, data: { role } });

  // إنشاء ملف الخبير عند ترقية المستخدم
  if (role === "EXPERT") {
    await prisma.expertProfile
      .create({ data: { userId: id, titlePrefix: "د." } })
      .catch(() => undefined);
  }

  await audit(admin.id, "user.role", "User", id, { role });
  revalidatePath("/admin/users");
}

/* ============================================================
   أدوات الذكاء الاصطناعي
   ============================================================ */

export async function toggleAiToolAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN", "MODERATOR");

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const tool = await prisma.aiTool.findUnique({ where: { id } });
  if (!tool) return;

  await prisma.aiTool.update({ where: { id }, data: { isActive: !tool.isActive } });
  await audit(admin.id, "aiTool.toggle", "AiTool", id, { isActive: !tool.isActive });

  revalidatePath("/admin/ai-tools");
  revalidatePath("/tools");
}

/* ============================================================
   طلبات صياغة السيرة الذاتية
   ============================================================ */

export async function advanceOrderAction(formData: FormData): Promise<void> {
  const admin = await requireRole("ADMIN", "MODERATOR");

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  const valid = ["SUBMITTED", "IN_EXPERT_REVIEW", "ATS_CHECK", "DELIVERED", "CANCELLED"];
  if (!id || !valid.includes(status)) return;

  const order = await prisma.cvOrder.findUnique({
    where: { id },
    include: { timeline: { orderBy: { sortOrder: "asc" } } },
  });
  if (!order) return;

  // مواءمة مراحل التايملاين مع الحالة الجديدة
  const stageIndex: Record<string, number> = {
    SUBMITTED: 0,
    IN_EXPERT_REVIEW: 1,
    ATS_CHECK: 2,
    DELIVERED: 3,
  };
  const target = stageIndex[status];

  if (target != null) {
    await Promise.all(
      order.timeline.map((event, i) =>
        prisma.cvOrderEvent.update({
          where: { id: event.id },
          data: {
            status: i < target ? "DONE" : i === target ? "IN_PROGRESS" : "PENDING",
            occurredAt: i <= target ? (event.occurredAt ?? new Date()) : null,
          },
        }),
      ),
    );

    if (status === "DELIVERED") {
      await prisma.cvOrderEvent.updateMany({
        where: { orderId: id },
        data: { status: "DONE" },
      });
    }
  }

  await prisma.cvOrder.update({
    where: { id },
    data: {
      status: status as never,
      deliveredAt: status === "DELIVERED" ? new Date() : null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: order.userId,
      type: "ORDER_UPDATE",
      title:
        status === "DELIVERED"
          ? "سيرتك الذاتية جاهزة 🎉"
          : "تحديث على طلب صياغة سيرتك الذاتية",
      body: `رقم الطلب ${order.orderNumber}.`,
      actionLabel: "متابعة الطلب",
      actionUrl: `/tools/cv-builder/orders/${order.id}`,
    },
  });

  await audit(admin.id, "cvOrder.status", "CvOrder", id, { status });

  revalidatePath("/admin/orders");
  revalidatePath(`/tools/cv-builder/orders/${id}`);
}

/* ============================================================
   إرسال إشعار جماعي
   ============================================================ */

export async function broadcastNotificationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const admin = await requireRole("ADMIN", "MODERATOR");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const actionLabel = String(formData.get("actionLabel") ?? "").trim();
  const actionUrl = String(formData.get("actionUrl") ?? "").trim();
  const audience = String(formData.get("audience") ?? "all");

  if (title.length < 3) return fail("عنوان الإشعار مطلوب.");
  if (body.length < 5) return fail("نص الإشعار قصير جداً.");

  const where =
    audience === "active"
      ? { role: "STUDENT" as const, status: "ACTIVE" as const }
      : { role: "STUDENT" as const };

  const recipients = await prisma.user.findMany({ where, select: { id: true } });

  if (recipients.length === 0) return fail("لا يوجد مستخدمون مطابقون.");

  await prisma.notification.createMany({
    data: recipients.map((r) => ({
      userId: r.id,
      type: "SYSTEM" as const,
      title,
      body,
      actionLabel: actionLabel || null,
      actionUrl: actionUrl || null,
      badgeLabel: "من المنصة",
    })),
  });

  await audit(admin.id, "notification.broadcast", "Notification", "bulk", {
    count: recipients.length,
    title,
  });

  revalidatePath("/admin/notifications");
  return succeed(`تم إرسال الإشعار إلى ${recipients.length} مستخدماً.`);
}
