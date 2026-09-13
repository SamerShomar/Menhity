import type { Metadata } from "next";
import Link from "next/link";
import { Download, UserCheck, UserPlus, UserX, Users } from "lucide-react";
import type { Prisma, UserRole, UserStatus } from "@prisma/client";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setUserRoleAction, setUserStatusAction } from "@/app/actions/admin";
import { ADMIN_PAGE_SIZE, USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/lib/constants";
import { formatDateAr, formatNumber, initials } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Td } from "@/components/admin/data-table";

export const metadata: Metadata = { title: "المستخدمون" };

const STATUS_TONES: Record<UserStatus, "success" | "neutral" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  SUSPENDED: "danger",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }>;
}) {
  const admin = await requireRole("ADMIN", "MODERATOR");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.UserWhereInput = {};

  if (params.q) {
    where.OR = [
      { fullName: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.role && ["STUDENT", "EXPERT", "MODERATOR", "ADMIN"].includes(params.role)) {
    where.role = params.role as UserRole;
  }
  if (params.status && ["ACTIVE", "INACTIVE", "SUSPENDED"].includes(params.status)) {
    where.status = params.status as UserStatus;
  }

  const weekAgo = new Date(Date.now() - 7 * 86_400_000);

  const [total, rows, totalAll, activeCount, suspendedCount, newCount] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        suspensionReason: true,
        profile: { select: { headline: true, country: true } },
      },
    }),
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { status: "SUSPENDED" } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  const activePercent = totalAll > 0 ? Math.round((activeCount / totalAll) * 1000) / 10 : 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...params, ...overrides })) {
      if (value) qs.set(key, String(value));
    }
    const s = qs.toString();
    return s ? `/admin/users?${s}` : "/admin/users";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="المستخدمون"
        badge={`${formatNumber(totalAll)} سجل`}
        description="إدارة ومتابعة المستخدمين المسجّلين في منصة منحتي ومراقبة نشاطهم واستخدامهم للأدوات الأكاديمية."
        actions={
          <a
            href="/admin/users/export"
            className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-ink-300 bg-white px-5 text-sm font-semibold text-ink-700 hover:border-navy-300 hover:text-navy-700"
          >
            <Download className="size-4" />
            تصدير CSV
          </a>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي المستخدمين"
          value={formatNumber(totalAll)}
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="المستخدمون النشطون"
          value={formatNumber(activeCount)}
          hint={`${activePercent}% من الإجمالي`}
          tone="success"
          icon={<UserCheck className="size-5" />}
        />
        <StatCard
          label="مستخدمون جدد"
          value={formatNumber(newCount)}
          hint="آخر 7 أيام"
          tone="info"
          icon={<UserPlus className="size-5" />}
        />
        <StatCard
          label="الحسابات الموقوفة"
          value={formatNumber(suspendedCount)}
          hint="تحتاج تدقيق"
          tone="danger"
          icon={<UserX className="size-5" />}
        />
      </div>

      {/* --- الفلاتر --- */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4">
        <form action="/admin/users" className="flex flex-1 flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="ابحث بالاسم أو البريد…"
            aria-label="بحث في المستخدمين"
            className="h-9 min-w-48 flex-1 rounded-lg border border-ink-300 bg-white px-3 text-[12.5px] focus:border-navy-500 focus:outline-none"
          />

          <select
            name="role"
            defaultValue={params.role ?? ""}
            aria-label="نوع الحساب"
            className="h-9 rounded-lg border border-ink-300 bg-white px-3 text-[12.5px] focus:border-navy-500 focus:outline-none"
          >
            <option value="">كل الأنواع</option>
            {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            name="status"
            defaultValue={params.status ?? ""}
            aria-label="حالة الحساب"
            className="h-9 rounded-lg border border-ink-300 bg-white px-3 text-[12.5px] focus:border-navy-500 focus:outline-none"
          >
            <option value="">كل الحالات</option>
            {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="h-9 rounded-lg bg-navy-700 px-4 text-[12.5px] font-semibold text-white hover:bg-navy-800"
          >
            تطبيق
          </button>
        </form>

        {(params.q || params.role || params.status) && (
          <Link href="/admin/users" className="text-[12px] font-semibold text-danger hover:underline">
            إعادة تعيين
          </Link>
        )}
      </div>

      {/* --- الجدول --- */}
      <DataTable
        columns={["المستخدم", "البريد الإلكتروني", "نوع الحساب", "تاريخ التسجيل", "الحالة", "إجراءات"]}
        empty={rows.length === 0}
        footer={
          <>
            <span className="num text-[12px] text-ink-500">
              عرض {rows.length > 0 ? (page - 1) * ADMIN_PAGE_SIZE + 1 : 0}–
              {(page - 1) * ADMIN_PAGE_SIZE + rows.length} من {formatNumber(total)} مستخدم
            </span>
            <Pagination
              page={page}
              totalPages={totalPages}
              buildHref={(p) => buildHref({ page: p === 1 ? undefined : String(p) })}
            />
          </>
        }
      >
        {rows.map((u) => (
          <tr key={u.id} className="transition-colors hover:bg-ink-50">
            <Td>
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[11px] font-bold text-navy-700">
                  {initials(u.fullName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-ink-900">{u.fullName}</p>
                  <p className="truncate text-[11px] text-ink-400">
                    {u.profile?.headline ?? "—"}
                    {u.profile?.country ? ` · ${u.profile.country}` : ""}
                  </p>
                </div>
              </div>
            </Td>
            <Td>
              <span dir="ltr" className="text-ink-600">
                {u.email}
              </span>
            </Td>
            <Td>
              {u.id === admin.id || admin.role !== "ADMIN" ? (
                <Badge tone="neutral">{USER_ROLE_LABELS[u.role]}</Badge>
              ) : (
                <form action={setUserRoleAction}>
                  <input type="hidden" name="id" value={u.id} />
                  <select
                    name="role"
                    defaultValue={u.role}
                    aria-label={`تغيير دور ${u.fullName}`}
                    className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-[11.5px] focus:border-navy-500 focus:outline-none"
                    // الإرسال يتم بزر منفصل للحفاظ على العمل بدون جافاسكربت
                  >
                    {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="ms-1.5 rounded-md px-1.5 py-1 text-[11px] font-semibold text-navy-600 hover:bg-navy-50"
                  >
                    حفظ
                  </button>
                </form>
              )}
            </Td>
            <Td>
              <span className="num">{formatDateAr(u.createdAt)}</span>
            </Td>
            <Td>
              <Badge tone={STATUS_TONES[u.status]} dot>
                {USER_STATUS_LABELS[u.status]}
              </Badge>
              {u.status === "SUSPENDED" && u.suspensionReason && (
                <p className="mt-1 max-w-[12rem] text-[10.5px] leading-snug text-danger">
                  {u.suspensionReason}
                </p>
              )}
            </Td>
            <Td>
              {u.id === admin.id ? (
                <span className="text-[11.5px] text-ink-400">حسابك</span>
              ) : (
                <form action={setUserStatusAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="id" value={u.id} />
                  {u.status === "SUSPENDED" ? (
                    <>
                      <input type="hidden" name="status" value="ACTIVE" />
                      <button
                        type="submit"
                        className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-[color:var(--color-success)] hover:bg-success-soft"
                      >
                        إعادة التفعيل
                      </button>
                    </>
                  ) : (
                    <>
                      <input type="hidden" name="status" value="SUSPENDED" />
                      <input
                        type="text"
                        name="reason"
                        placeholder="سبب الإيقاف"
                        aria-label="سبب الإيقاف"
                        className="h-8 w-28 rounded-lg border border-ink-200 px-2 text-[11px] focus:border-danger focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-danger hover:bg-danger-soft"
                      >
                        إيقاف
                      </button>
                    </>
                  )}
                </form>
              )}
            </Td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
