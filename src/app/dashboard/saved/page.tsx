import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Globe, GraduationCap, Wallet } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEGREE_LABELS, FUNDING_LABELS } from "@/lib/constants";
import { countryFlag, deadlineLabel, deadlineUrgency } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SaveButton } from "@/components/scholarships/save-button";

export const metadata: Metadata = { title: "المنح المحفوظة" };

export default async function SavedPage() {
  const user = await requireUser();

  const saved = await prisma.savedScholarship.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { scholarship: { include: { levels: true } } },
  });

  return (
    <div>
      <header className="mb-6 text-center sm:text-start">
        <h1 className="font-display text-2xl font-extrabold text-ink-900">المنح المحفوظة</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">
          تابع حالة المنح التي قمت بحفظها ومواعيد التقديم النهائية. نحن نساعدك في البقاء منظّماً
          لتحقيق أهدافك الأكاديمية.
        </p>
      </header>

      {saved.length === 0 ? (
        <Card>
          <EmptyState
            title="لا يوجد منح محفوظة"
            description="احفظ منحك المفضّلة لتعرضها هنا وتتابع مواعيدها بسهولة."
            action={
              <ButtonLink href="/scholarships" variant="gold" size="lg">
                تصفّح المنح
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {saved.map(({ scholarship }) => {
            const urgency = deadlineUrgency(scholarship.deadline);

            // شكل الزر يتغيّر حسب قرب الموعد النهائي
            const cta =
              urgency === "passed"
                ? { variant: "outline" as const, label: "التفاصيل" }
                : urgency === "urgent"
                  ? { variant: "primary" as const, label: "قدّم الآن" }
                  : urgency === "soon"
                    ? { variant: "gold" as const, label: "قدّم الآن" }
                    : { variant: "outline" as const, label: "التفاصيل" };

            return (
              <li key={scholarship.id}>
                <Card className="flex h-full flex-col p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <SaveButton scholarshipId={scholarship.id} saved />
                    <span className="text-2xl leading-none" aria-hidden="true">
                      {countryFlag(scholarship.countryCode)}
                    </span>
                  </div>

                  <h2 className="text-[14.5px] font-bold leading-snug text-navy-800">
                    <Link href={`/scholarships/${scholarship.slug}`} className="hover:underline">
                      {scholarship.titleAr}
                    </Link>
                  </h2>

                  <ul className="mt-3 space-y-2 text-[12px] text-ink-600">
                    <li className="flex items-center gap-2">
                      <GraduationCap className="size-3.5 text-ink-400" />
                      {scholarship.levels.map((l) => DEGREE_LABELS[l.level]).join(" · ")}
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="size-3.5 text-ink-400" />
                      {scholarship.countryNameAr}
                    </li>
                    <li className="flex items-center gap-2">
                      <Wallet className="size-3.5 text-ink-400" />
                      {FUNDING_LABELS[scholarship.fundingType]}
                    </li>
                  </ul>

                  <div className="mt-3">
                    <Badge
                      tone={
                        urgency === "passed"
                          ? "neutral"
                          : urgency === "urgent"
                            ? "danger"
                            : urgency === "soon"
                              ? "warning"
                              : "info"
                      }
                    >
                      {deadlineLabel(scholarship.deadline)}
                    </Badge>
                  </div>

                  <ButtonLink
                    href={`/scholarships/${scholarship.slug}`}
                    variant={cta.variant}
                    fullWidth
                    className="mt-4"
                  >
                    {cta.label}
                  </ButtonLink>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {saved.length > 0 && (
        <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-ink-400">
          <Bookmark className="size-3.5" />
          لديك <span className="num font-bold text-ink-600">{saved.length}</span> منحة محفوظة
        </p>
      )}
    </div>
  );
}
