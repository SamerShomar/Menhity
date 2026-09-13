import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileWarning,
  GraduationCap,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "لوحة التحكم" };

export default async function AdminHomePage() {
  const user = await requireRole("ADMIN", "MODERATOR");

  const in48Hours = new Date(Date.now() + 48 * 3600_000);

  const [
    totalScholarships,
    publishedScholarships,
    totalUsers,
    pendingReview,
    closingSoon,
    incomplete,
    openOrders,
    totalRuns,
  ] = await Promise.all([
    prisma.scholarship.count(),
    prisma.scholarship.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.scholarship.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.scholarship.count({
      where: { status: "PUBLISHED", deadline: { gte: new Date(), lte: in48Hours } },
    }),
    prisma.scholarship.count({
      where: { OR: [{ description: null }, { deadline: null }, { status: "DRAFT" }] },
    }),
    prisma.cvOrder.count({ where: { status: { in: ["SUBMITTED", "IN_EXPERT_REVIEW", "ATS_CHECK"] } } }),
    prisma.aiToolRun.count(),
  ]);

  const attention = [
    {
      count: pendingReview,
      title: "منح تحتاج مراجعة واعتماد",
      note: "معلّقة بانتظار قرار النشر",
      href: "/admin/scholarships?status=PENDING_REVIEW",
      cta: "مراجعة",
      icon: ClipboardList,
      tone: "warning" as const,
    },
    {
      count: closingSoon,
      title: "منح أقرب موعد للنهاية",
      note: "أقل من 48 ساعة على الإغلاق",
      href: "/admin/scholarships?closing=1",
      cta: "عرض المنح",
      icon: CalendarClock,
      tone: "danger" as const,
    },
    {
      count: incomplete,
      title: "منح تحتوي على بيانات ناقصة",
      note: "مطلوب استكمال الوصف أو الموعد النهائي",
      href: "/admin/scholarships?status=DRAFT",
      cta: "استكمال البيانات",
      icon: FileWarning,
      tone: "info" as const,
    },
  ].filter((item) => item.count > 0);

  const publishedPercent =
    totalScholarships > 0 ? Math.round((publishedScholarships / totalScholarships) * 100) : 0;

  const firstName = user.fullName.trim().split(/\s+/)[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`مرحباً، ${firstName} 👋`}
        description="إليك ملخّص سريع لأداء المنصة وحالة بيانات المنح الدراسية اليوم."
        actions={
          <ButtonLink href="/admin/scholarships/new">
            <Plus className="size-4" />
            إضافة منحة جديدة
          </ButtonLink>
        }
      />

      {/* --- الإحصائيات --- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي المنح"
          value={formatNumber(totalScholarships)}
          hint="منحة مسجّلة"
          icon={<GraduationCap className="size-5" />}
        />
        <StatCard
          label="المنح النشطة حالياً"
          value={formatNumber(publishedScholarships)}
          hint={`${publishedPercent}% من الإجمالي`}
          tone="success"
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="المستخدمون المسجّلون"
          value={formatNumber(totalUsers)}
          hint="طالب وطالبة"
          tone="info"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="تحتاج إلى مراجعة"
          value={formatNumber(pendingReview + incomplete)}
          hint="عنصر بانتظار إجراء"
          tone="danger"
          icon={<AlertTriangle className="size-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* --- تحتاج إلى انتباه --- */}
        <Card>
          <CardHeader
            title="تحتاج إلى انتباه"
            subtitle="العناصر المعلّقة التي تنتظر قرارك أو استكمال بياناتها."
            icon={<AlertTriangle className="size-4" />}
            action={
              attention.length > 0 ? (
                <span className="rounded-full bg-danger-soft px-2.5 py-1 text-[11px] font-bold text-[#991b1b]">
                  <span className="num">{attention.length}</span> إجراءات مطلوبة
                </span>
              ) : undefined
            }
          />

          <CardBody className="pt-4">
            {attention.length === 0 ? (
              <div className="flex items-center gap-3 rounded-xl bg-success-soft p-4">
                <CheckCircle2 className="size-5 text-[color:var(--color-success)]" />
                <p className="text-[13px] font-semibold text-[#166534]">
                  لا توجد عناصر معلّقة — كل شيء على ما يرام.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {attention.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={
                          item.tone === "danger"
                            ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-danger-soft text-[#991b1b]"
                            : item.tone === "warning"
                              ? "flex size-9 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-[#92400e]"
                              : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-info-soft text-[#1e40af]"
                        }
                      >
                        <item.icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-ink-900">
                          <span className="num">{item.count}</span> {item.title}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-ink-500">{item.note}</p>
                      </div>
                    </div>

                    <ButtonLink href={item.href} size="sm" variant="outline" className="shrink-0">
                      {item.cta}
                    </ButtonLink>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* --- إجراءات سريعة --- */}
        <Card>
          <CardHeader
            title="إجراءات سريعة"
            subtitle="الوصول المباشر إلى الأقسام الأساسية."
          />
          <CardBody className="pt-4">
            <ul className="grid grid-cols-2 gap-3">
              <QuickAction
                href="/admin/scholarships"
                icon={<GraduationCap className="size-5" />}
                label="إدارة المنح"
                note={`${formatNumber(publishedScholarships)} نشطة`}
              />
              <QuickAction
                href="/admin/scholarships/new"
                icon={<Plus className="size-5" />}
                label="إضافة منحة"
                note="إدخال جديد"
              />
              <QuickAction
                href="/admin/users"
                icon={<Users className="size-5" />}
                label="المستخدمون"
                note="الطلاب والباحثون"
              />
              <QuickAction
                href="/admin/orders"
                icon={<ClipboardList className="size-5" />}
                label="الطلبات"
                note={`${formatNumber(openOrders)} قيد المعالجة`}
              />
              <QuickAction
                href="/admin/ai-tools"
                icon={<Sparkles className="size-5" />}
                label="أدوات الذكاء"
                note={`${formatNumber(totalRuns)} استخدام`}
              />
              <QuickAction
                href="/admin/notifications"
                icon={<Bell className="size-5" />}
                label="الإشعارات"
                note="إرسال للمستخدمين"
              />
            </ul>

            <p className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-success-soft py-2 text-[11.5px] font-semibold text-[#166534]">
              <CheckCircle2 className="size-3.5" />
              مؤشر المزامنة يعمل بكفاءة <span className="num">99.9%</span>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  note,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  note: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex h-full flex-col items-center gap-1.5 rounded-xl border border-ink-200 bg-white p-3.5 text-center transition-colors hover:border-navy-300 hover:bg-navy-50"
      >
        <span className="text-navy-600">{icon}</span>
        <span className="text-[12px] font-bold text-ink-800">{label}</span>
        <span className="num text-[10.5px] text-ink-400">{note}</span>
      </Link>
    </li>
  );
}
