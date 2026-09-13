import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  MessageSquare,
  PenLine,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankScholarships } from "@/lib/matching";
import { getOrCreateProfile } from "@/lib/student-data";
import { CV_ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn, countryFlag, formatDateAr, timeAgoAr } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProgressRing } from "@/components/ui/progress";
import { OrderNoteForm } from "@/components/tools/order-note-form";
import { Stepper } from "@/components/tools/stepper";

export const metadata: Metadata = { title: "متابعة طلب صياغة السيرة الذاتية" };

const STEPS = [
  { n: 1, label: "المعلومات الشخصية" },
  { n: 2, label: "التعليم والمؤهلات" },
  { n: 3, label: "الخبرات والأنشطة" },
  { n: 4, label: "المهارات والإنجازات" },
  { n: 5, label: "تدقيق وصياغة الخبير" },
];

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const order = await prisma.cvOrder.findFirst({
    where: { id, userId: user.id },
    include: {
      timeline: { orderBy: { sortOrder: "asc" } },
      atsChecks: { orderBy: { sortOrder: "asc" } },
      notes: { orderBy: { createdAt: "desc" }, include: { author: { select: { fullName: true, role: true } } } },
      expert: {
        select: {
          fullName: true,
          expertProfile: { select: { titlePrefix: true, specialization: true, bio: true } },
        },
      },
    },
  });

  if (!order) notFound();

  const profile = await getOrCreateProfile(user.id);
  const scholarships = await prisma.scholarship.findMany({
    where: { status: "PUBLISHED", deadline: { gte: new Date() } },
    include: { levels: true, majors: true },
    take: 30,
  });

  const suggested = rankScholarships(profile, scholarships)
    .filter((r) => r.score > 0)
    .slice(0, 2);

  const delivered = order.status === "DELIVERED";

  return (
    <div className="container-page py-10">
      <div className="mx-auto mb-8 max-w-3xl">
        <Stepper steps={STEPS} current={5} hrefFor={() => "#"} maxReachable={0} />
      </div>

      <div className="mx-auto max-w-4xl space-y-5">
        {/* ================= لافتة الحالة ================= */}
        <section className="relative overflow-hidden rounded-2xl bg-navy-800 p-7 text-white">
          <div className="absolute inset-0 bg-gradient-to-l from-navy-600 to-navy-900" />

          <div className="relative">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="gold">حالة الطلب: {CV_ORDER_STATUS_LABELS[order.status]}</Badge>
              <span className="num rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold">
                رقم الطلب {order.orderNumber}
              </span>
            </div>

            <h1 className="font-display text-xl font-extrabold leading-snug sm:text-2xl">
              {delivered
                ? "سيرتك الذاتية جاهزة! 🎉"
                : "تم استلام طلبك بنجاح! جارٍ تحويل بياناتك إلى خبير أكاديمي مختص"}
            </h1>

            <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-navy-100">
              {delivered
                ? "اعتمد الخبير الأكاديمي النسخة النهائية من سيرتك الذاتية بعد المراجعة اليدوية والفحص الآلي."
                : "تمت إحالة كافة بياناتك الأكاديمية والمهنية إلى فريق مستشاري القبولات بالمنح. سيقوم الخبير بإعادة صياغة الإنجازات والأنشطة البحثية بلغة أكاديمية موجّهة، بما يطابق معايير الفرز الدولية (ATS) ولجان التقييم البشرية."}
            </p>

            <ul className="mt-5 flex flex-wrap gap-2">
              <InfoChip icon={<Clock className="size-3.5" />}>
                الوقت المتوقّع للتسليم: خلال <span className="num">24–48</span> ساعة عمل
              </InfoChip>
              <InfoChip icon={<Bell className="size-3.5" />}>
                إشعار فوري عند الجاهزية عبر البريد
              </InfoChip>
              <InfoChip icon={<ShieldCheck className="size-3.5" />}>
                ضمان جودة صياغة مخصّصة <span className="num">100%</span>
              </InfoChip>
            </ul>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          {/* ================= المتابعة والتفاصيل ================= */}
          <div className="space-y-5">
            <Card>
              <CardHeader
                title="متابعة وتفاصيل طلب الصياغة الأكاديمية"
                subtitle="تتبّع مسار العمل والمستشار المسؤول عن تدقيق سيرتك."
                icon={<UserRoundCheck className="size-4" />}
              />

              <CardBody className="pt-4">
                {/* --- الخبير المعيّن --- */}
                {order.expert ? (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy-700 text-[13px] font-bold text-white">
                      {order.expert.expertProfile?.titlePrefix ?? "د."}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold text-ink-900">
                        {order.expert.expertProfile?.titlePrefix ?? "د."} {order.expert.fullName}
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-ink-500">
                        {order.expert.expertProfile?.specialization ?? "خبير أكاديمي"}
                      </p>
                      {order.expert.expertProfile?.bio && (
                        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">
                          {order.expert.expertProfile.bio}
                        </p>
                      )}
                    </div>
                    <Badge tone="success" dot>
                      الخبير المعيّن
                    </Badge>
                  </div>
                ) : (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-warning-soft p-4 text-[12.5px] text-[#78350f]">
                    جارٍ إسناد طلبك إلى الخبير الأكاديمي المناسب.
                  </div>
                )}

                {/* --- التايملاين --- */}
                <h3 className="mb-3 text-[13px] font-bold text-ink-900">
                  خطوات ومراحل صياغة المستند النهائي
                </h3>

                <ol className="space-y-0">
                  {order.timeline.map((event, i) => {
                    const isLast = i === order.timeline.length - 1;
                    return (
                      <li key={event.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                        {!isLast && (
                          <span
                            className={cn(
                              "absolute start-[13px] top-7 h-[calc(100%-1.25rem)] w-0.5",
                              event.status === "DONE"
                                ? "bg-[color:var(--color-success)]"
                                : "bg-ink-200",
                            )}
                            aria-hidden="true"
                          />
                        )}

                        <span
                          className={cn(
                            "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full",
                            event.status === "DONE"
                              ? "bg-success-soft text-[color:var(--color-success)]"
                              : event.status === "IN_PROGRESS"
                                ? "bg-info-soft text-[color:var(--color-info)]"
                                : "bg-ink-100 text-ink-400",
                          )}
                        >
                          {event.status === "DONE" ? (
                            <CheckCircle2 className="size-4" />
                          ) : event.status === "IN_PROGRESS" ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Circle className="size-3.5" />
                          )}
                        </span>

                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-[13px] font-semibold text-ink-800">
                            <span className="num">{i + 1}.</span> {event.title}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge
                              tone={
                                event.status === "DONE"
                                  ? "success"
                                  : event.status === "IN_PROGRESS"
                                    ? "info"
                                    : "neutral"
                              }
                            >
                              {event.status === "DONE"
                                ? "مكتمل"
                                : event.status === "IN_PROGRESS"
                                  ? "قيد التنفيذ"
                                  : "بانتظار"}
                            </Badge>
                            {event.occurredAt && (
                              <span className="text-[11px] text-ink-400">
                                {timeAgoAr(event.occurredAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                {/* --- الملاحظات --- */}
                <div className="mt-6 border-t border-ink-100 pt-5">
                  {order.notes.length > 0 && (
                    <ul className="mb-5 space-y-3">
                      {order.notes.map((note) => (
                        <li key={note.id} className="rounded-xl bg-ink-50 p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[12px] font-bold text-ink-800">
                              {note.author.role === "EXPERT" ? "د. " : ""}
                              {note.author.fullName}
                            </p>
                            <span className="text-[11px] text-ink-400">
                              {timeAgoAr(note.createdAt)}
                            </span>
                          </div>
                          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600">
                            {note.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <OrderNoteForm orderId={order.id} />
                </div>
              </CardBody>
            </Card>

            {/* ================= ما يمكنك فعله أثناء الانتظار ================= */}
            <Card>
              <CardHeader
                title="ما يمكنك فعله أثناء انتظار خبيرك الأكاديمي"
                subtitle="استثمر وقتك قبل تسليم السيرة."
                icon={<Sparkles className="size-4" />}
              />

              <CardBody className="space-y-3 pt-4">
                {suggested.map(({ scholarship, score }) => (
                  <div
                    key={scholarship.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-ink-50 p-4"
                  >
                    <div className="min-w-0">
                      <div className="mb-1.5 flex items-center gap-2">
                        <Badge tone="gold">
                          مطابقة <span className="num">{score}%</span>
                        </Badge>
                      </div>
                      <p className="truncate text-[13px] font-bold text-ink-900">
                        <span className="me-1">{countryFlag(scholarship.countryCode)}</span>
                        {scholarship.titleAr}
                      </p>
                      <p className="num mt-0.5 text-[11.5px] text-ink-500">
                        آخر موعد: {formatDateAr(scholarship.deadline)}
                      </p>
                    </div>
                    <ButtonLink href={`/scholarships/${scholarship.slug}`} size="sm" className="shrink-0">
                      استعراض المتطلبات
                    </ButtonLink>
                  </div>
                ))}

                <div className="rounded-xl border border-navy-100 bg-navy-50 p-4">
                  <h3 className="flex items-center gap-2 text-[13px] font-bold text-navy-800">
                    <PenLine className="size-4" />
                    إنشاء خطاب الدافع بالذكاء الاصطناعي
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-navy-700/70">
                    استغل نقاط القوة ومشاريعك المستخلصة من سيرتك الذاتية لكتابة خطاب دافع أكاديمي
                    مقنع فوراً.
                  </p>
                  <ButtonLink href="/tools/letter-builder" size="sm" className="mt-3">
                    توليد الخطاب الآن
                  </ButtonLink>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <ButtonLink href="/dashboard/profile" size="sm">
                    الانتقال إلى ملفي الأكاديمي
                    <ArrowLeft className="size-3.5" />
                  </ButtonLink>
                  <ButtonLink href="/scholarships?sort=match" size="sm" variant="outline">
                    استكشاف كافة المنح المتوافقة
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* ================= تقرير ATS ================= */}
          <aside className="space-y-5">
            <Card>
              <CardHeader
                title="التدقيق الأكاديمي الشامل"
                subtitle="بشري + ذكاء اصطناعي"
                icon={<BadgeCheck className="size-4" />}
              />

              <CardBody className="pt-4">
                <div className="flex items-center gap-4 rounded-xl bg-ink-50 p-4">
                  <ProgressRing value={order.atsScore ?? 0} size={68} />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-ink-900">
                      معدل توافق الفرز الأكاديمي الآلي
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-500">
                      فحص آلي لمؤشرات تتبعها لجان منح MEXT و DAAD و Chevening.
                    </p>
                  </div>
                </div>

                <ul className="mt-4 space-y-3">
                  {order.atsChecks.map((check) => (
                    <li key={check.id} className="flex gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                          check.passed
                            ? "bg-success-soft text-[color:var(--color-success)]"
                            : "bg-warning-soft text-[#92400e]",
                        )}
                      >
                        {check.passed ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <Circle className="size-3" />
                        )}
                      </span>
                      <p className="text-[11.5px] leading-relaxed text-ink-600">{check.label}</p>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            {delivered && order.finalFileUrl && (
              <Card>
                <CardBody>
                  <h3 className="text-[13px] font-bold text-ink-900">النسخة النهائية</h3>
                  <ButtonLink href={order.finalFileUrl} fullWidth className="mt-3">
                    تنزيل السيرة الذاتية
                  </ButtonLink>
                </CardBody>
              </Card>
            )}

            <div className="rounded-2xl border border-ink-200 bg-white p-5 text-center">
              <MessageSquare className="mx-auto size-6 text-navy-500" />
              <p className="mt-2.5 text-[12px] leading-relaxed text-ink-500">
                لديك استفسار حول الطلب؟ راسل فريق الدعم وسنرد خلال ساعات العمل.
              </p>
              <Link
                href="/contact"
                className="mt-3 inline-block text-[12.5px] font-bold text-navy-700 hover:underline"
              >
                تواصل معنا
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11.5px] font-medium backdrop-blur">
      {icon}
      {children}
    </li>
  );
}
