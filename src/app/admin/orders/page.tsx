import type { Metadata } from "next";
import { ClipboardList, Clock, PackageCheck, UserRoundCheck } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { advanceOrderAction } from "@/app/actions/admin";
import { CV_ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatNumber, timeAgoAr } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Td } from "@/components/admin/data-table";

export const metadata: Metadata = { title: "الطلبات" };

const NEXT_STATUS: Record<string, { value: string; label: string } | null> = {
  SUBMITTED: { value: "IN_EXPERT_REVIEW", label: "بدء مراجعة الخبير" },
  IN_EXPERT_REVIEW: { value: "ATS_CHECK", label: "إرسال لفحص ATS" },
  ATS_CHECK: { value: "DELIVERED", label: "تسليم النسخة النهائية" },
  DELIVERED: null,
  CANCELLED: null,
  DRAFT: null,
};

export default async function AdminOrdersPage() {
  await requireRole("ADMIN", "MODERATOR");

  const [orders, total, inProgress, delivered] = await Promise.all([
    prisma.cvOrder.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: { createdAt: "desc" },
      take: 40,
      include: {
        user: { select: { fullName: true, email: true } },
        expert: { select: { fullName: true } },
      },
    }),
    prisma.cvOrder.count({ where: { status: { not: "DRAFT" } } }),
    prisma.cvOrder.count({
      where: { status: { in: ["SUBMITTED", "IN_EXPERT_REVIEW", "ATS_CHECK"] } },
    }),
    prisma.cvOrder.count({ where: { status: "DELIVERED" } }),
  ]);

  const unassigned = orders.filter((o) => !o.expert).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الطلبات"
        badge={`${formatNumber(total)} طلب`}
        description="متابعة طلبات صياغة السير الذاتية المحالة إلى الخبراء الأكاديميين وتحديث مراحلها."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي الطلبات"
          value={formatNumber(total)}
          icon={<ClipboardList className="size-5" />}
        />
        <StatCard
          label="قيد المعالجة"
          value={formatNumber(inProgress)}
          tone="gold"
          icon={<Clock className="size-5" />}
        />
        <StatCard
          label="تم التسليم"
          value={formatNumber(delivered)}
          tone="success"
          icon={<PackageCheck className="size-5" />}
        />
        <StatCard
          label="بدون خبير معيّن"
          value={formatNumber(unassigned)}
          hint="تحتاج إسناد"
          tone="danger"
          icon={<UserRoundCheck className="size-5" />}
        />
      </div>

      <DataTable
        columns={["رقم الطلب", "الطالب", "الخبير المعيّن", "توافق ATS", "آخر تحديث", "الحالة", "إجراء"]}
        empty={orders.length === 0}
      >
        {orders.map((order) => {
          const next = NEXT_STATUS[order.status];

          return (
            <tr key={order.id} className="transition-colors hover:bg-ink-50">
              <Td>
                <span className="num font-bold text-navy-700">{order.orderNumber}</span>
              </Td>
              <Td>
                <p className="font-semibold text-ink-800">{order.user.fullName}</p>
                <p className="text-[11px] text-ink-400" dir="ltr">
                  {order.user.email}
                </p>
              </Td>
              <Td className="text-ink-600">
                {order.expert ? `د. ${order.expert.fullName}` : <Badge tone="danger">غير معيّن</Badge>}
              </Td>
              <Td>
                <span className="num font-bold text-ink-700">
                  {order.atsScore != null ? `${order.atsScore}%` : "—"}
                </span>
              </Td>
              <Td className="text-ink-500">{timeAgoAr(order.updatedAt)}</Td>
              <Td>
                <Badge
                  tone={
                    order.status === "DELIVERED"
                      ? "success"
                      : order.status === "CANCELLED"
                        ? "danger"
                        : "info"
                  }
                  dot
                >
                  {CV_ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </Td>
              <Td>
                {next ? (
                  <form action={advanceOrderAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={next.value} />
                    <button
                      type="submit"
                      className="rounded-lg bg-navy-700 px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-navy-800"
                    >
                      {next.label}
                    </button>
                  </form>
                ) : (
                  <span className="text-[11.5px] text-ink-400">—</span>
                )}
              </Td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}
