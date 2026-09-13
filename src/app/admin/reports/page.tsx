import type { Metadata } from "next";
import { Activity, Bookmark, GraduationCap, Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AI_RUN_STATUS_LABELS, SCHOLARSHIP_STATUS_LABELS } from "@/lib/constants";
import { countryFlag, formatNumber, timeAgoAr } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Td } from "@/components/admin/data-table";
import { BarList, STATUS_COLORS, StatusBar, TrendChart } from "@/components/admin/charts";

export const metadata: Metadata = { title: "التقارير والإحصائيات" };

const DAYS = 14;

/** يبني سلسلة الأيام الأربعة عشر الماضية (الأقدم أولاً) */
function buildDaySeries(rows: { createdAt: Date }[]) {
  const buckets = new Map<string, number>();

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of rows) {
    const key = new Date(row.createdAt).toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, buckets.get(key)! + 1);
  }

  return [...buckets.entries()].map(([key, value]) => {
    const d = new Date(key);
    return { label: `${d.getDate()}/${d.getMonth() + 1}`, value };
  });
}

export default async function AdminReportsPage() {
  await requireRole("ADMIN", "MODERATOR");

  const since = new Date(Date.now() - DAYS * 86_400_000);

  const [
    byCountry,
    byStatus,
    byMajor,
    runRows,
    signupRows,
    totalScholarships,
    totalUsers,
    totalSaves,
    totalRuns,
    topSaved,
    failedRuns,
  ] = await Promise.all([
    prisma.scholarship.groupBy({
      by: ["countryCode", "countryNameAr"],
      where: { status: "PUBLISHED" },
      _count: { _all: true },
      orderBy: { _count: { countryCode: "desc" } },
      take: 8,
    }),
    prisma.scholarship.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.scholarshipMajor.groupBy({
      by: ["name"],
      _count: { _all: true },
      orderBy: { _count: { name: "desc" } },
      take: 8,
    }),
    prisma.aiToolRun.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.scholarship.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.savedScholarship.count(),
    prisma.aiToolRun.count(),
    prisma.savedScholarship.groupBy({
      by: ["scholarshipId"],
      _count: { _all: true },
      orderBy: { _count: { scholarshipId: "desc" } },
      take: 5,
    }),
    prisma.aiToolRun.findMany({
      where: { status: "FAILED" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { tool: { select: { nameAr: true } }, user: { select: { fullName: true } } },
    }),
  ]);

  const topSavedScholarships = await prisma.scholarship.findMany({
    where: { id: { in: topSaved.map((t) => t.scholarshipId) } },
    select: { id: true, titleAr: true, countryCode: true },
  });

  const savedCountById = new Map(topSaved.map((t) => [t.scholarshipId, t._count._all]));

  const countFor = (status: string) =>
    byStatus.find((s) => s.status === status)?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="التقارير والإحصائيات"
        description={`نظرة تحليلية على محتوى المنصة ونشاط المستخدمين خلال آخر ${DAYS} يوماً.`}
      />

      {/* --- مؤشرات الأداء --- */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="المنح المنشورة"
          value={formatNumber(totalScholarships)}
          icon={<GraduationCap className="size-5" />}
        />
        <StatCard
          label="الطلاب المسجّلون"
          value={formatNumber(totalUsers)}
          tone="info"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="عمليات الحفظ"
          value={formatNumber(totalSaves)}
          hint="منح محفوظة لدى الطلاب"
          tone="gold"
          icon={<Bookmark className="size-5" />}
        />
        <StatCard
          label="تشغيلات أدوات الذكاء"
          value={formatNumber(totalRuns)}
          tone="success"
          icon={<Activity className="size-5" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* --- المنح حسب الدولة --- */}
        <Card>
          <CardHeader
            title="المنح المنشورة حسب الدولة"
            subtitle="أعلى ثماني دول من حيث عدد المنح المتاحة."
          />
          <CardBody className="pt-4">
            <BarList
              valueLabel="منحة"
              items={byCountry.map((c) => ({
                label: c.countryNameAr,
                value: c._count._all,
                prefix: countryFlag(c.countryCode),
              }))}
            />
          </CardBody>
        </Card>

        {/* --- التخصصات الأكثر طلباً --- */}
        <Card>
          <CardHeader
            title="التخصصات الأكثر تكراراً"
            subtitle="التخصصات التي تتكرر في شروط المنح المسجّلة."
          />
          <CardBody className="pt-4">
            <BarList
              valueLabel="منحة"
              items={byMajor.map((m) => ({ label: m.name, value: m._count._all }))}
            />
          </CardBody>
        </Card>
      </div>

      {/* --- توزيع حالات المنح --- */}
      <Card>
        <CardHeader
          title="توزيع حالات المنح"
          subtitle="نسبة المنح المنشورة مقابل المسودات والمعلّقة والمنتهية."
        />
        <CardBody className="pt-4">
          <StatusBar
            segments={[
              {
                label: SCHOLARSHIP_STATUS_LABELS.PUBLISHED,
                value: countFor("PUBLISHED"),
                color: STATUS_COLORS.published,
              },
              {
                label: SCHOLARSHIP_STATUS_LABELS.PENDING_REVIEW,
                value: countFor("PENDING_REVIEW"),
                color: STATUS_COLORS.pending,
              },
              {
                label: SCHOLARSHIP_STATUS_LABELS.DRAFT,
                value: countFor("DRAFT"),
                color: STATUS_COLORS.draft,
              },
              {
                label: SCHOLARSHIP_STATUS_LABELS.EXPIRED,
                value: countFor("EXPIRED") + countFor("ARCHIVED"),
                color: STATUS_COLORS.expired,
              },
            ]}
          />
        </CardBody>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* --- منحنى استخدام الأدوات --- */}
        <Card>
          <CardHeader
            title="استخدام أدوات الذكاء الاصطناعي"
            subtitle={`عدد التشغيلات اليومية خلال آخر ${DAYS} يوماً.`}
          />
          <CardBody className="pt-4">
            <TrendChart points={buildDaySeries(runRows)} valueLabel="تشغيل" />
          </CardBody>
        </Card>

        {/* --- منحنى التسجيلات --- */}
        <Card>
          <CardHeader
            title="تسجيلات المستخدمين الجدد"
            subtitle={`عدد الحسابات الجديدة يومياً خلال آخر ${DAYS} يوماً.`}
          />
          <CardBody className="pt-4">
            <TrendChart points={buildDaySeries(signupRows)} valueLabel="تسجيل" />
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* --- المنح الأكثر حفظاً --- */}
        <Card>
          <CardHeader title="المنح الأكثر حفظاً" subtitle="أكثر المنح إضافةً إلى محفوظات الطلاب." />
          <CardBody className="pt-4">
            {topSavedScholarships.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-ink-400">لا توجد بيانات بعد.</p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {topSavedScholarships
                  .sort((a, b) => (savedCountById.get(b.id) ?? 0) - (savedCountById.get(a.id) ?? 0))
                  .map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="truncate text-[12.5px] text-ink-700">
                        <span className="me-1.5">{countryFlag(s.countryCode)}</span>
                        {s.titleAr}
                      </span>
                      <span className="num shrink-0 text-[12px] font-bold text-navy-700">
                        {formatNumber(savedCountById.get(s.id) ?? 0)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </CardBody>
        </Card>

        {/* --- التشغيلات الفاشلة --- */}
        <Card>
          <CardHeader
            title="آخر التشغيلات الفاشلة"
            subtitle="أخطاء أدوات الذكاء الاصطناعي التي تحتاج متابعة."
          />
          <CardBody className="pt-3">
            {failedRuns.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[color:var(--color-success)]">
                لا توجد تشغيلات فاشلة — كل شيء يعمل بسلاسة.
              </p>
            ) : (
              <DataTable columns={["الأداة", "المستخدم", "الخطأ", "التاريخ"]} empty={false}>
                {failedRuns.map((run) => (
                  <tr key={run.id}>
                    <Td>{run.tool.nameAr}</Td>
                    <Td className="text-ink-500">{run.user?.fullName ?? "—"}</Td>
                    <Td>
                      <Badge tone="danger">{AI_RUN_STATUS_LABELS.FAILED}</Badge>
                      {run.errorMessage && (
                        <p className="mt-1 max-w-[16rem] text-[10.5px] leading-snug text-ink-500">
                          {run.errorMessage}
                        </p>
                      )}
                    </Td>
                    <Td className="text-ink-400">{timeAgoAr(run.createdAt)}</Td>
                  </tr>
                ))}
              </DataTable>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
