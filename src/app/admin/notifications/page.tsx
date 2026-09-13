import type { Metadata } from "next";
import { Bell, MailCheck, Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NOTIFICATION_TYPE_LABELS } from "@/lib/constants";
import { formatNumber, timeAgoAr } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BroadcastForm } from "@/components/admin/broadcast-form";

export const metadata: Metadata = { title: "الإشعارات" };

export default async function AdminNotificationsPage() {
  await requireRole("ADMIN", "MODERATOR");

  const [total, unread, allStudents, activeStudents, recent] = await Promise.all([
    prisma.notification.count(),
    prisma.notification.count({ where: { readAt: null } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
    prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      include: { user: { select: { fullName: true } } },
    }),
  ]);

  const readRate = total > 0 ? Math.round(((total - unread) / total) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="الإشعارات"
        description="إرسال إشعارات جماعية للطلاب ومتابعة آخر الإشعارات المرسلة على المنصة."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي الإشعارات"
          value={formatNumber(total)}
          icon={<Bell className="size-5" />}
        />
        <StatCard
          label="نسبة القراءة"
          value={`${readRate}%`}
          hint={`${formatNumber(unread)} غير مقروء`}
          tone="success"
          icon={<MailCheck className="size-5" />}
        />
        <StatCard
          label="المستلمون المحتملون"
          value={formatNumber(activeStudents)}
          hint={`من أصل ${formatNumber(allStudents)} طالب`}
          tone="info"
          icon={<Users className="size-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader title="إرسال إشعار جماعي" subtitle="يصل الإشعار فوراً إلى لوحة كل مستخدم." />
          <CardBody className="pt-4">
            <BroadcastForm counts={{ all: allStudents, active: activeStudents }} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="آخر الإشعارات المرسلة" />
          <CardBody className="pt-3">
            <ul className="divide-y divide-ink-100">
              {recent.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink-900">{n.title}</p>
                    <p className="mt-0.5 truncate text-[11.5px] text-ink-500">
                      إلى {n.user.fullName} · {timeAgoAr(n.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone="neutral">{NOTIFICATION_TYPE_LABELS[n.type]}</Badge>
                    <Badge tone={n.readAt ? "success" : "warning"}>
                      {n.readAt ? "مقروء" : "غير مقروء"}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
