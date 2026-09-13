import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  BookmarkCheck,
  CalendarX,
  CheckCheck,
  CheckCircle2,
  Clock,
  GraduationCap,
  Info,
} from "lucide-react";
import type { NotificationType } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markAllReadAction } from "@/app/actions/notifications";
import { cn, timeAgoAr } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata: Metadata = { title: "الإشعارات" };

/** لكل نوع إشعار لون وأيقونة وبادج خاص به */
const STYLES: Record<
  NotificationType,
  { icon: typeof Bell; bar: string; chip: string; iconBox: string }
> = {
  NEW_MATCH: {
    icon: GraduationCap,
    bar: "border-s-[color:var(--color-info)]",
    chip: "bg-info-soft text-[#1e40af]",
    iconBox: "bg-info-soft text-[#1e40af]",
  },
  DEADLINE_REMINDER: {
    icon: Clock,
    bar: "border-s-[color:var(--color-warning)]",
    chip: "bg-warning-soft text-[#92400e]",
    iconBox: "bg-warning-soft text-[#92400e]",
  },
  DOCUMENT_REVIEWED: {
    icon: CheckCircle2,
    bar: "border-s-[color:var(--color-success)]",
    chip: "bg-success-soft text-[#166534]",
    iconBox: "bg-success-soft text-[#166534]",
  },
  SAVED_UPDATED: {
    icon: BookmarkCheck,
    bar: "border-s-ink-300",
    chip: "bg-ink-100 text-ink-600",
    iconBox: "bg-ink-100 text-ink-600",
  },
  DEADLINE_PASSED: {
    icon: CalendarX,
    bar: "border-s-[color:var(--color-danger)]",
    chip: "bg-danger-soft text-[#991b1b]",
    iconBox: "bg-danger-soft text-[#991b1b]",
  },
  ORDER_UPDATE: {
    icon: Info,
    bar: "border-s-navy-500",
    chip: "bg-navy-50 text-navy-700",
    iconBox: "bg-navy-50 text-navy-700",
  },
  SYSTEM: {
    icon: Bell,
    bar: "border-s-navy-400",
    chip: "bg-navy-50 text-navy-700",
    iconBox: "bg-navy-50 text-navy-700",
  },
};

const TABS = [
  { key: "all", label: "الكل" },
  { key: "matches", label: "منح مناسبة لك" },
  { key: "deadlines", label: "المواعيد" },
] as const;

const TAB_TYPES: Record<string, NotificationType[] | undefined> = {
  matches: ["NEW_MATCH"],
  deadlines: ["DEADLINE_REMINDER", "DEADLINE_PASSED"],
};

/** تجميع الإشعارات زمنياً: اليوم / هذا الأسبوع / أقدم */
function groupByPeriod<T extends { createdAt: Date }>(items: T[]) {
  const now = Date.now();
  const today: T[] = [];
  const week: T[] = [];
  const older: T[] = [];

  for (const item of items) {
    const age = now - item.createdAt.getTime();
    if (age < 86_400_000) today.push(item);
    else if (age < 7 * 86_400_000) week.push(item);
    else older.push(item);
  }

  return [
    { label: "اليوم", items: today },
    { label: "هذا الأسبوع", items: week },
    { label: "أقدم", items: older },
  ].filter((g) => g.items.length > 0);
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await requireUser();
  const { tab = "all" } = await searchParams;

  const types = TAB_TYPES[tab];

  const [notifications, counts] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id, ...(types ? { type: { in: types } } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.groupBy({
      by: ["type"],
      where: { userId: user.id },
      _count: { _all: true },
    }),
  ]);

  const countFor = (key: string): number => {
    const list = TAB_TYPES[key];
    if (!list) return counts.reduce((sum, c) => sum + c._count._all, 0);
    return counts.filter((c) => list.includes(c.type)).reduce((s, c) => s + c._count._all, 0);
  };

  const groups = groupByPeriod(notifications);
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">الإشعارات</h1>
          <p className="mt-2 text-[13.5px] text-ink-500">
            تابع آخر التنبيهات المتعلقة بالمنح والفرص المناسبة لك.
          </p>
        </div>

        {hasUnread && (
          <form action={markAllReadAction}>
            <SubmitButton variant="outline" size="sm" pendingText="جارٍ التحديث…">
              <CheckCheck className="size-4" />
              تحديد الكل كمقروء
            </SubmitButton>
          </form>
        )}
      </header>

      {/* --- التابات --- */}
      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <Link
              key={t.key}
              href={t.key === "all" ? "/dashboard/notifications" : `/dashboard/notifications?tab=${t.key}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
                active
                  ? "bg-navy-700 text-white"
                  : "border border-ink-200 bg-white text-ink-600 hover:border-navy-300",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "num rounded-full px-1.5 text-[10px]",
                  active ? "bg-white/20" : "bg-ink-100 text-ink-500",
                )}
              >
                {countFor(t.key)}
              </span>
            </Link>
          );
        })}
      </nav>

      {notifications.length === 0 ? (
        <Card>
          <EmptyState
            illustration={false}
            icon={<Bell className="size-6" />}
            title="لا توجد إشعارات"
            description="ستظهر هنا تنبيهات المنح الجديدة ومواعيد التقديم القريبة."
          />
        </Card>
      ) : (
        <div className="space-y-7">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 flex items-center gap-2 text-[12px] font-bold text-ink-400">
                <span className="size-1.5 rounded-full bg-navy-400" />
                {group.label}
              </h2>

              <ul className="space-y-2.5">
                {group.items.map((n) => {
                  const style = STYLES[n.type];
                  const unread = !n.readAt;

                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border border-ink-200 border-s-4 p-4 transition-colors",
                        style.bar,
                        unread ? "bg-navy-50/40" : "bg-white",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-xl",
                          style.iconBox,
                        )}
                      >
                        <style.icon className="size-4" />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[13.5px] font-bold text-ink-900">{n.title}</h3>
                          {n.badgeLabel && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10.5px] font-bold",
                                style.chip,
                              )}
                            >
                              {n.badgeLabel}
                            </span>
                          )}
                          {unread && <span className="size-1.5 rounded-full bg-navy-600" />}
                        </div>

                        {n.body && (
                          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{n.body}</p>
                        )}
                        <p className="mt-1.5 text-[11px] text-ink-400">{timeAgoAr(n.createdAt)}</p>
                      </div>

                      {n.actionUrl && n.actionLabel && (
                        <Link
                          href={n.actionUrl}
                          className="shrink-0 self-center rounded-lg bg-navy-700 px-3 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-navy-800"
                        >
                          {n.actionLabel}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
