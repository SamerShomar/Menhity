import { useRef, useState } from "react";
import { ArrowLeft, ClipboardList, Download, Upload } from "lucide-react";

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
  const deliver = useSubmit(({ id, file }) => adminApi.deliverOrder(id, file));

  // مُدخل ملف واحد مخفي يخدم كل الصفوف — نتذكّر أي صفّ فتحه
  const fileInput = useRef(null);
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(null);

  const meta = data?.meta ?? {};

  const onDownloadSource = async (row) => {
    setBusy(row.id);
    try {
      await adminApi.downloadOrderSource(row.id, row.source_file_name);
    } finally {
      setBusy(null);
    }
  };

  const pickFinalFile = (row) => {
    setTarget(row.id);
    fileInput.current?.click();
  };

  const onFilePicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !target) return;

    const { ok } = await deliver.submit({ id: target, file });
    setTarget(null);
    if (ok) reload(true);
  };

  const onAdvance = async (row) => {
    const { ok } = await advance.submit({ id: row.id, status: row.next_status });
    if (ok) reload(true);
  };

  const columns = [
    {
      key: "order",
      header: "الطلب",
      cell: (row) => (
        <div className="min-w-0">
          <p className="num font-bold text-navy-800">{row.order_number}</p>
          <p className="mt-0.5 text-[12.5px] font-semibold text-ink-700">{row.kind_label}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-500">{timeAgoAr(row.updated_at)}</p>
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
      key: "files",
      header: "الملفات",
      cell: (row) => (
        <div className="flex max-w-[220px] flex-col items-start gap-1.5">
          {row.request_note ? (
            <p className="line-clamp-2 text-[11.5px] leading-5 text-ink-500" title={row.request_note}>
              {row.request_note}
            </p>
          ) : null}
          {row.has_source_file ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDownloadSource(row)}
              loading={busy === row.id}
              loadingText="جارٍ التحميل…"
            >
              <Download className="size-3.5" />
              ملف الطالب
            </Button>
          ) : (
            <span className="text-[12px] text-ink-400">بلا ملف مرفق</span>
          )}

          {row.has_final_file ? (
            <span className="text-[11.5px] font-semibold text-[color:var(--color-success)]">
              ✓ سُلّم: {row.final_file_name}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      cell: (row) => (
        <div className="flex flex-col items-start gap-1.5">
          <Badge tone={STATUS_TONE[row.status] ?? "neutral"} dot>
            {row.status_label}
          </Badge>
          {row.ats_score !== null && row.ats_score !== undefined ? (
            <span className="num text-[11.5px] text-ink-500">ATS {row.ats_score}</span>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <div className="flex flex-col items-start gap-1.5">
          <Button
            size="sm"
            variant="gold"
            onClick={() => pickFinalFile(row)}
            loading={deliver.submitting && target === row.id}
            loadingText="جارٍ الرفع…"
          >
            <Upload className="size-3.5" />
            {row.has_final_file ? "استبدال التسليم" : "تسليم الملف"}
          </Button>

          {row.next_status ? (
            <Button size="sm" variant="ghost" onClick={() => onAdvance(row)} disabled={advance.submitting}>
              {row.next_status_label}
              <ArrowLeft className="size-3.5" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="طلبات صياغة السيرة الذاتية"
        description="حمّل ملف الطالب، اعمل عليه، ثم ارفع النسخة النهائية ليصله إشعار بالتحميل."
      />

      {error ? <Alert tone="danger">{error}</Alert> : null}
      {advance.error ? <Alert tone="danger">{advance.error}</Alert> : null}
      {deliver.error ? <Alert tone="danger">{deliver.error}</Alert> : null}
      {deliver.success ? <Alert tone="success">تم تسليم الملف وإشعار الطالب.</Alert> : null}

      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onFilePicked}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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
