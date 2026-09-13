import type { Metadata } from "next";
import {
  Activity,
  Database,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiConfigured } from "@/lib/ai";
import { SITE } from "@/lib/constants";
import { formatNumber, timeAgoAr } from "@/lib/utils";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Td } from "@/components/admin/data-table";

export const metadata: Metadata = { title: "إعدادات المنصة" };

export default async function AdminSettingsPage() {
  await requireRole("ADMIN", "MODERATOR");

  const [tables, recentAudit, activeSessions, contactMessages] = await Promise.all([
    Promise.all([
      prisma.user.count(),
      prisma.scholarship.count(),
      prisma.document.count(),
      prisma.notification.count(),
      prisma.aiToolRun.count(),
    ]),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { actor: { select: { fullName: true } } },
    }),
    prisma.session.count({ where: { revokedAt: null, expiresAt: { gt: new Date() } } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  const [users, scholarships, documents, notifications, runs] = tables;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="إعدادات المنصة"
        description="معلومات التشغيل وحالة التكاملات وسجل الإجراءات الإدارية."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* --- معلومات المنصة --- */}
        <Card>
          <CardHeader title="معلومات المنصة" icon={<Globe className="size-4" />} />
          <CardBody className="pt-3">
            <dl className="divide-y divide-ink-100">
              <Row icon={<Globe className="size-4" />} label="اسم المنصة">
                {SITE.name} ({SITE.nameEn})
              </Row>
              <Row icon={<Mail className="size-4" />} label="البريد الرسمي">
                <span dir="ltr">{SITE.email}</span>
              </Row>
              <Row icon={<Phone className="size-4" />} label="رقم التواصل">
                <span className="num">{SITE.phone}</span>
              </Row>
              <Row icon={<MapPin className="size-4" />} label="الموقع">
                {SITE.address}
              </Row>
            </dl>

            <p className="mt-4 text-[11.5px] leading-relaxed text-ink-400">
              تُقرأ هذه القيم من ملف <code className="font-mono">src/lib/constants.ts</code> —
              عدّلها هناك لتنعكس على الموقع والفوتر كاملاً.
            </p>
          </CardBody>
        </Card>

        {/* --- حالة التكاملات --- */}
        <Card>
          <CardHeader title="حالة التكاملات" icon={<KeyRound className="size-4" />} />
          <CardBody className="space-y-3 pt-4">
            <IntegrationRow
              icon={<Database className="size-4" />}
              name="قاعدة البيانات (PostgreSQL)"
              ok
              note="متصلة وتعمل"
            />
            <IntegrationRow
              icon={<Sparkles className="size-4" />}
              name="مزوّد الذكاء الاصطناعي (Claude)"
              ok={isAiConfigured()}
              note={isAiConfigured() ? "المفتاح مضبوط" : "وضع المحاكاة — المفتاح غير مضبوط"}
            />
            <IntegrationRow
              icon={<Mail className="size-4" />}
              name="خدمة البريد الإلكتروني"
              ok={false}
              note="غير مربوطة — رموز التحقق تُطبع في سجل الخادم"
            />
            <IntegrationRow
              icon={<ShieldCheck className="size-4" />}
              name="تسجيل الدخول الخارجي (Google / Apple)"
              ok={false}
              note="غير مفعّل — يحتاج بيانات اعتماد OAuth"
            />

            {!isAiConfigured() && (
              <Alert tone="warning">
                أضف <code className="font-mono">ANTHROPIC_API_KEY</code> في ملف{" "}
                <code className="font-mono">.env</code> لتفعيل التوليد الفعلي بدل وضع المحاكاة.
              </Alert>
            )}
          </CardBody>
        </Card>
      </div>

      {/* --- إحصائيات التخزين --- */}
      <Card>
        <CardHeader title="حجم البيانات" icon={<Database className="size-4" />} />
        <CardBody className="pt-4">
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: "المستخدمون", value: users },
              { label: "المنح", value: scholarships },
              { label: "المستندات", value: documents },
              { label: "الإشعارات", value: notifications },
              { label: "تشغيلات الأدوات", value: runs },
            ].map((item) => (
              <li key={item.label} className="rounded-xl border border-ink-200 bg-ink-50 p-3.5 text-center">
                <p className="num text-lg font-extrabold text-navy-700">{formatNumber(item.value)}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-500">{item.label}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-4 text-[12px] text-ink-500">
            <span className="flex items-center gap-1.5">
              <Activity className="size-3.5 text-navy-500" />
              الجلسات النشطة: <span className="num font-bold text-ink-800">{activeSessions}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="size-3.5 text-navy-500" />
              رسائل تواصل غير مقروءة:{" "}
              <span className="num font-bold text-ink-800">{contactMessages}</span>
            </span>
          </div>
        </CardBody>
      </Card>

      {/* --- سجل الإجراءات --- */}
      <section>
        <h2 className="mb-4 text-[15px] font-bold text-ink-900">سجل الإجراءات الإدارية</h2>

        <DataTable
          columns={["المُنفِّذ", "الإجراء", "العنصر", "التاريخ"]}
          empty={recentAudit.length === 0}
        >
          {recentAudit.map((log) => (
            <tr key={log.id} className="transition-colors hover:bg-ink-50">
              <Td className="font-semibold text-ink-800">{log.actor?.fullName ?? "النظام"}</Td>
              <Td>
                <Badge tone="neutral">{log.action}</Badge>
              </Td>
              <Td className="text-ink-500">
                {log.entityType ?? "—"}
                {log.entityId ? ` · ${log.entityId.slice(0, 8)}` : ""}
              </Td>
              <Td className="text-ink-400">{timeAgoAr(log.createdAt)}</Td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <dt className="flex items-center gap-2 text-[12.5px] text-ink-500">
        <span className="text-navy-500">{icon}</span>
        {label}
      </dt>
      <dd className="truncate text-[12.5px] font-semibold text-ink-800">{children}</dd>
    </div>
  );
}

function IntegrationRow({
  icon,
  name,
  ok,
  note,
}: {
  icon: React.ReactNode;
  name: string;
  ok: boolean;
  note: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="text-navy-500">{icon}</span>
        <div className="min-w-0">
          <p className="truncate text-[12.5px] font-semibold text-ink-800">{name}</p>
          <p className="truncate text-[11px] text-ink-500">{note}</p>
        </div>
      </div>
      <Badge tone={ok ? "success" : "warning"} dot>
        {ok ? "مفعّل" : "غير مفعّل"}
      </Badge>
    </div>
  );
}
