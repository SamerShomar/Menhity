import { Activity, Database, Mail, MessageSquare, Server, Sparkles } from "lucide-react";

import { BarList, CHART_COLORS } from "@/components/admin/Charts";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingBlock } from "@/components/ui/Spinner";
import { adminApi } from "@/api/endpoints";
import { useApi } from "@/hooks/useApi";
import { timeAgoAr } from "@/lib/utils";

const INTEGRATION_ICON = {
  database: Database,
  ai: Sparkles,
  mail: Mail,
  storage: Server,
};

export default function AdminSettingsPage() {
  const { data, loading, error } = useApi(adminApi.settings, []);

  if (loading) return <LoadingBlock className="py-24" />;
  if (error) return <Alert tone="danger">{error}</Alert>;

  const site = data?.site ?? {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="إعدادات المنصة"
        description="بيانات المنصة وحالة التكاملات وحجم البيانات وسجل العمليات."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="الجلسات النشطة" value={data?.active_sessions ?? 0} icon={<Activity className="size-5" />} />
        <StatCard
          label="رسائل تواصل غير مقروءة"
          value={data?.unread_messages ?? 0}
          icon={<MessageSquare className="size-5" />}
          tone="gold"
        />
        <StatCard
          label="التكاملات العاملة"
          value={`${(data?.integrations ?? []).filter((item) => item.ok).length} / ${(data?.integrations ?? []).length}`}
          icon={<Server className="size-5" />}
          tone="info"
        />
      </div>

      {/* بيانات المنصة */}
      <Card>
        <CardHeader
          title="بيانات المنصة"
          subtitle="تُعرض في الواجهة والفوتر، وتُضبط من ملف إعدادات الخادم config/menhity.php."
        />
        <CardBody>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["الاسم", site.name],
              ["الاسم بالإنجليزية", site.name_en],
              ["الشعار النصي", site.tagline],
              ["البريد الإلكتروني", site.email],
              ["الهاتف", site.phone],
              ["العنوان", site.address],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 rounded-lg bg-ink-50 px-4 py-3">
                <dt className="text-[12.5px] font-semibold text-ink-500">{label}</dt>
                <dd className="text-end text-[13px] font-bold text-navy-800">{value || "—"}</dd>
              </div>
            ))}
          </dl>

          {site.description ? (
            <p className="mt-4 rounded-lg bg-ink-50 px-4 py-3 text-[13px] leading-7 text-ink-600">
              {site.description}
            </p>
          ) : null}
        </CardBody>
      </Card>

      {/* التكاملات */}
      <Card>
        <CardHeader title="حالة التكاملات" icon={<Server className="size-4" />} />
        <CardBody>
          <ul className="divide-y divide-ink-200">
            {(data?.integrations ?? []).map((integration) => {
              const IntegrationIcon = INTEGRATION_ICON[integration.key] ?? Server;

              return (
                <li key={integration.key} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-50 text-navy-600">
                    <IntegrationIcon className="size-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-navy-800">{integration.name}</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-500">{integration.note}</p>
                  </div>

                  <Badge tone={integration.ok ? "success" : "warning"} dot>
                    {integration.ok ? "متصل" : "غير مفعّل"}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      {/* حجم البيانات */}
      <Card>
        <CardHeader title="حجم البيانات" subtitle="عدد السجلات في كل جدول رئيسي." icon={<Database className="size-4" />} />
        <CardBody>
          <BarList items={data?.data_sizes ?? []} valueLabel="سجل" color={CHART_COLORS[0]} />
        </CardBody>
      </Card>

      {/* سجل العمليات */}
      <Card>
        <CardHeader title="سجل العمليات الإدارية" subtitle="آخر الإجراءات التي نُفّذت من لوحة الإدارة." />
        <CardBody>
          {(data?.audit_log ?? []).length === 0 ? (
            <p className="py-6 text-center text-[13px] text-ink-500">لا توجد عمليات مسجّلة بعد.</p>
          ) : (
            <ul className="divide-y divide-ink-200">
              {data.audit_log.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-navy-800">{entry.description ?? entry.action}</p>
                    <p className="mt-0.5 text-[12px] text-ink-500">{entry.actor_name ?? "النظام"}</p>
                  </div>
                  <span className="shrink-0 text-[12px] text-ink-400">{timeAgoAr(entry.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
