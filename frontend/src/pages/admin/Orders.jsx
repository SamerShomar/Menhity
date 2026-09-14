import { ArrowLeft, ClipboardList } from "lucide-react";

import { DataTable } from "@/components/admin/DataTable";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { adminApi } from "@/api/endpoints";
import { useApi, useSubmit } from "@/hooks/useApi";
import { timeAgoAr } from "@/lib/utils";

const STATUS_TONE = {
  submitted: "info",
  in_expert_review: "warning",
  ats_check: "warning",
  delivered: "success",
  cancelled: "danger",
};

export default function AdminOrdersPage() {
  const { data, loading, error, reload } = useApi(adminApi.orders, []);
  const advance = useSubmit(({ id, status }) => adminApi.advanceOrder(id, status));

  const meta = data?.meta ?? {};

  const onAdvance = async (row) => {
    const { ok } = await advance.submit({ id: row.id, status: row.next_status });
    if (ok) reload(true);
  };

  const columns = [
    {
      key: "order",
      header: "الطلب",
      cell: (row) => (
        <div>
          <p className="num font-bold text-navy-800">{row.order_number}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">{timeAgoAr(row.updated_at)}</p>
        </div>
      ),
    },
    {
      key: "student",
      header: "الطالب",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-800">{row.student_name}</p>
          <p className="truncate text-[12px] text-ink-500" dir="ltr">
            {row.student_email}
          </p>
        </div>
      ),
    },
    {
      key: "expert",
      header: "الخبير",
      cell: (row) =>
        row.expert_name ? (
          <span className="text-ink-700">{row.expert_name}</span>
        ) : (
          <Badge tone="warning">غير مُسنَد</Badge>
        ),
    },
    {
      key: "ats",
      header: "ATS",
      cell: (row) => <span className="num font-bold text-navy-700">{row.ats_score ?? "—"}</span>,
    },
    {
      key: "status",
      header: "الحالة",
      cell: (row) => (
        <Badge tone={STATUS_TONE[row.status] ?? "neutral"} dot>
          {row.status_label}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row) =>
        row.next_status ? (
          <Button size="sm" variant="soft" onClick={() => onAdvance(row)} disabled={advance.submitting}>
            {row.next_status_label}
            <ArrowLeft className="size-3.5" />
          </Button>
        ) : (
          <span className="text-[12px] text-ink-400">مكتمل</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="طلبات صياغة السيرة الذاتية"
        description="تابع الطلبات وانقلها إلى المرحلة التالية حتى التسليم."
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {advance.error ? <Alert tone="danger">{advance.error}</Alert> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="إجمالي الطلبات" value={meta.total ?? 0} icon={<ClipboardList className="size-5" />} />
        <StatCard label="قيد التنفيذ" value={meta.in_progress ?? 0} tone="gold" />
        <StatCard label="مُسلّمة" value={meta.delivered ?? 0} tone="success" />
        <StatCard label="بلا خبير" value={meta.unassigned ?? 0} tone="danger" />
      </div>

      <Card>
        <CardBody className="p-0">
          <DataTable columns={columns} rows={data?.data} loading={loading} empty="لا توجد طلبات بعد." />
        </CardBody>
      </Card>
    </div>
  );
}
