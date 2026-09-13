import type { Metadata } from "next";
import Link from "next/link";
import { Activity, CheckCircle2, Trophy, Users } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toggleAiToolAction } from "@/app/actions/admin";
import { AI_RUN_STATUS_LABELS } from "@/lib/constants";
import { formatNumber, initials, timeAgoAr } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { StatCard } from "@/components/ui/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, Td } from "@/components/admin/data-table";

export const metadata: Metadata = { title: "أدوات الذكاء الاصطناعي" };

export default async function AdminAiToolsPage() {
  await requireRole("ADMIN", "MODERATOR");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [tools, totalRuns, beneficiaries, recent, successCount, monthRuns] = await Promise.all([
    prisma.aiTool.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { runs: { where: { createdAt: { gte: monthStart } } } } },
      },
    }),
    prisma.aiToolRun.count(),
    prisma.aiToolRun
      .findMany({ where: { userId: { not: null } }, select: { userId: true }, distinct: ["userId"] })
      .then((rows) => rows.length),
    prisma.aiToolRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        tool: { select: { nameAr: true, icon: true } },
        user: { select: { fullName: true } },
      },
    }),
    prisma.aiToolRun.count({ where: { status: "SUCCESS" } }),
    prisma.aiToolRun.count({ where: { createdAt: { gte: monthStart } } }),
  ]);

  const activeTools = tools.filter((t) => t.isActive).length;
  const successRate = totalRuns > 0 ? Math.round((successCount / totalRuns) * 1000) / 10 : 100;

  const mostUsed = [...tools].sort((a, b) => b._count.runs - a._count.runs)[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="أدوات الذكاء الاصطناعي"
        badge={`${tools.length} أدوات معتمدة`}
        description="إدارة ومتابعة أدوات الذكاء الاصطناعي المقدَّمة لمساعدة المستخدمين في تجهيز ملفاتهم للمنح."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="إجمالي الاستخدام"
          value={formatNumber(totalRuns)}
          icon={<Activity className="size-5" />}
        />
        <StatCard
          label="المستخدمون المستفيدون"
          value={formatNumber(beneficiaries)}
          tone="info"
          icon={<Users className="size-5" />}
        />
        <StatCard
          label="الأداة الأكثر استخداماً"
          value={mostUsed?.nameAr ?? "—"}
          hint={mostUsed ? `${formatNumber(mostUsed._count.runs)} هذا الشهر` : undefined}
          tone="gold"
          icon={<Trophy className="size-5" />}
        />
        <StatCard
          label="الأدوات النشطة"
          value={`${activeTools} / ${tools.length}`}
          hint={`جاهزية ${Math.round((activeTools / Math.max(1, tools.length)) * 100)}%`}
          tone="success"
          icon={<CheckCircle2 className="size-5" />}
        />
      </div>

      {/* --- بطاقات الأدوات --- */}
      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <h2 className="text-[15px] font-bold text-ink-900">الأدوات المتاحة</h2>
          <Badge tone="success" dot>
            <span className="num">{activeTools}</span> أدوات نشطة في واجهة الطلاب
          </Badge>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <li
              key={tool.id}
              className="flex flex-col rounded-2xl border border-ink-200 bg-white p-5"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                  <Icon name={tool.icon ?? "Sparkles"} className="size-5" />
                </span>
                <Badge tone={tool.isActive ? "success" : "neutral"} dot>
                  {tool.isActive ? "نشطة" : "معطّلة"}
                </Badge>
              </div>

              <h3 className="text-[14px] font-bold text-ink-900">{tool.nameAr}</h3>
              <p className="mt-2 flex-1 text-[12px] leading-relaxed text-ink-500">
                {tool.description}
              </p>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink-100 pt-3.5">
                <span className="num text-[11.5px] text-ink-400">
                  {formatNumber(tool._count.runs)} استخدام هذا الشهر
                </span>

                <form action={toggleAiToolAction}>
                  <input type="hidden" name="id" value={tool.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-ink-300 px-3 py-1.5 text-[11.5px] font-semibold text-ink-600 transition-colors hover:border-navy-300 hover:text-navy-700"
                  >
                    {tool.isActive ? "تعطيل الأداة" : "تفعيل الأداة"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- آخر الاستخدامات --- */}
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-ink-900">آخر استخدامات الأدوات</h2>
            <p className="mt-1 text-[12px] text-ink-500">
              سجل مباشر يوضّح أنشطة التوليد والتحسين للطلاب في الوقت الفعلي.
            </p>
          </div>
          <Link href="/admin/reports" className="text-[12.5px] font-semibold text-navy-600 hover:underline">
            عرض السجل الكامل
          </Link>
        </div>

        <DataTable
          columns={["المستخدم", "الأداة", "التاريخ", "المدة", "الحالة"]}
          empty={recent.length === 0}
          footer={
            <>
              <span className="num text-[12px] text-ink-500">
                عرض آخر {recent.length} من أصل {formatNumber(monthRuns)} هذا الشهر
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[color:var(--color-success)]">
                <span className="size-1.5 rounded-full bg-[color:var(--color-success)]" />
                نسبة النجاح التشغيلي <span className="num">{successRate}%</span>
              </span>
            </>
          }
        >
          {recent.map((run) => (
            <tr key={run.id} className="transition-colors hover:bg-ink-50">
              <Td>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-100 text-[10px] font-bold text-navy-700">
                    {initials(run.user?.fullName ?? "؟")}
                  </span>
                  <span className="font-semibold text-ink-800">
                    {run.user?.fullName ?? "مستخدم محذوف"}
                  </span>
                </div>
              </Td>
              <Td>
                <span className="flex items-center gap-2 text-ink-600">
                  <Icon name={run.tool.icon ?? "Sparkles"} className="size-3.5 text-navy-500" />
                  {run.tool.nameAr}
                </span>
              </Td>
              <Td className="text-ink-500">{timeAgoAr(run.createdAt)}</Td>
              <Td>
                <span className="num text-ink-500">
                  {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)} ث` : "—"}
                </span>
              </Td>
              <Td>
                <Badge
                  tone={
                    run.status === "SUCCESS" ? "success" : run.status === "FAILED" ? "danger" : "info"
                  }
                  dot
                >
                  {AI_RUN_STATUS_LABELS[run.status]}
                </Badge>
                {run.errorMessage && (
                  <p className="mt-1 max-w-[14rem] text-[10.5px] leading-snug text-danger">
                    {run.errorMessage}
                  </p>
                )}
              </Td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}
