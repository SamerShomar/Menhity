import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  FileWarning,
  GraduationCap,
  Pencil,
  Plus,
  XCircle,
} from "lucide-react";
import type { Prisma, ScholarshipStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { setScholarshipStatusAction } from "@/app/actions/admin";
import {
  ADMIN_PAGE_SIZE,
  DEGREE_LABELS,
  SCHOLARSHIP_STATUS_LABELS,
} from "@/lib/constants";
import { countryFlag, formatDateAr, formatNumber } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Td } from "@/components/admin/data-table";

export const metadata: Metadata = { title: "إدارة المنح" };

const STATUS_TONES: Record<ScholarshipStatus, "success" | "warning" | "danger" | "neutral" | "info"> = {
  PUBLISHED: "success",
  PENDING_REVIEW: "warning",
  DRAFT: "neutral",
  EXPIRED: "danger",
  ARCHIVED: "info",
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "الكل" },
  { value: "PUBLISHED", label: "منشورة" },
  { value: "PENDING_REVIEW", label: "بانتظار المراجعة" },
  { value: "DRAFT", label: "مسودات" },
  { value: "EXPIRED", label: "منتهية" },
];

export default async function AdminScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; country?: string; closing?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.ScholarshipWhereInput = {};

  if (params.q) {
    where.OR = [
      { titleAr: { contains: params.q, mode: "insensitive" } },
      { titleEn: { contains: params.q, mode: "insensitive" } },
      { provider: { contains: params.q, mode: "insensitive" } },
    ];
  }

  if (params.status && STATUS_FILTERS.some((f) => f.value === params.status)) {
    where.status = params.status as ScholarshipStatus;
  }

  if (params.country) where.countryCode = params.country.toUpperCase();

  if (params.closing === "1") {
    where.status = "PUBLISHED";
    where.deadline = { gte: new Date(), lte: new Date(Date.now() + 48 * 3600_000) };
  }

  const [total, rows, counts, countries] = await Promise.all([
    prisma.scholarship.count({ where }),
    prisma.scholarship.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      include: { levels: true },
    }),
    prisma.scholarship.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.scholarship.groupBy({
      by: ["countryCode", "countryNameAr"],
      _count: { _all: true },
      orderBy: { _count: { countryCode: "desc" } },
    }),
  ]);

  const countFor = (status: ScholarshipStatus) =>
    counts.find((c) => c.status === status)?._count._all ?? 0;

  const totalAll = counts.reduce((sum, c) => sum + c._count._all, 0);
  const published = countFor("PUBLISHED");
  const publishedPercent = totalAll > 0 ? Math.round((published / totalAll) * 1000) / 10 : 0;

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    const merged = { ...params, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) qs.set(key, String(value));
    }
    const s = qs.toString();
    return s ? `/admin/scholarships?${s}` : "/admin/scholarships";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="إدارة المنح"
        badge={`${formatNumber(totalAll)} منحة مسجّلة`}
        description="إدارة جميع المنح المنشورة على منصة منحتي ومراجعة بياناتها وحالتها التشغيلية."
        actions={
          <ButtonLink href="/admin/scholarships/new">
            <Plus className="size-4" />
            إضافة منحة جديدة
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي المنح"
          value={formatNumber(totalAll)}
          hint="منحة مسجّلة"
          icon={<GraduationCap className="size-5" />}
        />
        <StatCard
          label="منشورة ونشطة"
          value={formatNumber(published)}
          hint={`${publishedPercent}% من الإجمالي`}
          tone="success"
          icon={<CheckCircle2 className="size-5" />}
        />
        <StatCard
          label="مسودات ومعلّقة"
          value={formatNumber(countFor("DRAFT") + countFor("PENDING_REVIEW"))}
          hint="تحتاج استكمال أو اعتماد"
          tone="gold"
          icon={<ClipboardList className="size-5" />}
        />
        <StatCard
          label="منتهية التقديم"
          value={formatNumber(countFor("EXPIRED"))}
          hint="مؤرشفة آلياً"
          tone="danger"
          icon={<FileWarning className="size-5" />}
        />
      </div>

      {/* --- الفلاتر --- */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <form action="/admin/scholarships" className="flex flex-1 gap-2">
          {params.status && <input type="hidden" name="status" value={params.status} />}
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="ابحث عن اسم المنحة أو الجهة المانحة…"
            aria-label="بحث في المنح"
            className="h-9 min-w-48 flex-1 rounded-lg border border-ink-300 bg-white px-3 text-[12.5px] focus:border-navy-500 focus:outline-none"
          />
          <button
            type="submit"
            className="h-9 rounded-lg bg-navy-700 px-4 text-[12.5px] font-semibold text-white hover:bg-navy-800"
          >
            بحث
          </button>
        </form>

        <ul className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => {
            const active = (params.status ?? "") === filter.value && params.closing !== "1";
            return (
              <li key={filter.value || "all"}>
                <Link
                  href={buildHref({ status: filter.value || undefined, closing: undefined, page: undefined })}
                  className={
                    active
                      ? "inline-block rounded-lg bg-navy-700 px-3 py-1.5 text-[12px] font-semibold text-white"
                      : "inline-block rounded-lg border border-ink-200 px-3 py-1.5 text-[12px] font-semibold text-ink-600 hover:border-navy-300"
                  }
                >
                  {filter.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <form action="/admin/scholarships">
          <select
            name="country"
            defaultValue={params.country ?? ""}
            aria-label="تصفية حسب الدولة"
            className="h-9 rounded-lg border border-ink-300 bg-white px-3 text-[12.5px] focus:border-navy-500 focus:outline-none"
          >
            <option value="">كل الدول</option>
            {countries.map((c) => (
              <option key={c.countryCode} value={c.countryCode}>
                {c.countryNameAr} ({c._count._all})
              </option>
            ))}
          </select>
          <button type="submit" className="sr-only">
            تطبيق
          </button>
        </form>

        {(params.q || params.status || params.country || params.closing) && (
          <Link
            href="/admin/scholarships"
            className="text-[12px] font-semibold text-danger hover:underline"
          >
            إعادة ضبط
          </Link>
        )}
      </div>

      {/* --- الجدول --- */}
      <DataTable
        columns={["المنحة", "الجهة المانحة", "الدولة", "الموعد النهائي", "الحالة", "إجراءات"]}
        empty={rows.length === 0}
        footer={
          <>
            <span className="num text-[12px] text-ink-500">
              عرض {rows.length > 0 ? (page - 1) * ADMIN_PAGE_SIZE + 1 : 0}–
              {(page - 1) * ADMIN_PAGE_SIZE + rows.length} من {formatNumber(total)} منحة
            </span>
            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => buildHref({ page: p === 1 ? undefined : String(p) })}
            />
          </>
        }
      >
        {rows.map((s) => (
          <tr key={s.id} className="transition-colors hover:bg-ink-50">
            <Td>
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-sm">
                  {countryFlag(s.countryCode)}
                </span>
                <div className="min-w-0">
                  <Link
                    href={`/admin/scholarships/${s.id}`}
                    className="block truncate font-bold text-navy-700 hover:underline"
                  >
                    {s.titleAr}
                  </Link>
                  <p className="truncate text-[11px] text-ink-400">
                    {s.levels.map((l) => DEGREE_LABELS[l.level]).join(" · ")}
                  </p>
                </div>
              </div>
            </Td>
            <Td className="text-ink-600">{s.provider}</Td>
            <Td className="text-ink-600">{s.countryNameAr}</Td>
            <Td>
              <span className="num">{formatDateAr(s.deadline)}</span>
            </Td>
            <Td>
              <Badge tone={STATUS_TONES[s.status]} dot>
                {SCHOLARSHIP_STATUS_LABELS[s.status]}
              </Badge>
            </Td>
            <Td>
              <div className="flex items-center gap-1">
                <Link
                  href={`/scholarships/${s.slug}`}
                  target="_blank"
                  aria-label="معاينة في الموقع"
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-navy-700"
                >
                  <Eye className="size-4" />
                </Link>
                <Link
                  href={`/admin/scholarships/${s.id}`}
                  aria-label="تعديل"
                  className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-navy-700"
                >
                  <Pencil className="size-4" />
                </Link>

                {s.status !== "PUBLISHED" ? (
                  <form action={setScholarshipStatusAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value="PUBLISHED" />
                    <button
                      type="submit"
                      aria-label="نشر المنحة"
                      title="نشر"
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-success-soft hover:text-[color:var(--color-success)]"
                    >
                      <CheckCircle2 className="size-4" />
                    </button>
                  </form>
                ) : (
                  <form action={setScholarshipStatusAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value="ARCHIVED" />
                    <button
                      type="submit"
                      aria-label="أرشفة المنحة"
                      title="أرشفة"
                      className="rounded-lg p-1.5 text-ink-400 hover:bg-danger-soft hover:text-danger"
                    >
                      <XCircle className="size-4" />
                    </button>
                  </form>
                )}
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
