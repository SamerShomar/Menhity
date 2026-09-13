import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/constants";
import { computeMatch } from "@/lib/matching";
import {
  buildFilterHref,
  buildOrderBy,
  buildWhere,
  paginationArgs,
  parseFilters,
} from "@/lib/scholarship-query";
import { formatNumber } from "@/lib/utils";

import { ActiveFilters } from "@/components/scholarships/active-filters";
import { FiltersSidebar } from "@/components/scholarships/filters-sidebar";
import { ScholarshipCard } from "@/components/scholarships/scholarship-card";
import { SortSelect } from "@/components/scholarships/sort-select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";

export const metadata: Metadata = {
  title: "اكتشف المنح",
  description:
    "استكشف آلاف المنح الدراسية المتاحة حول العالم وابحث حسب الدولة والتخصص ومستوى الدراسة ونوع التمويل.",
};

const QUICK_FILTERS = [
  { label: "منح البكالوريوس", change: { level: ["BACHELOR"] } },
  { label: "منح الماجستير", change: { level: ["MASTER"] } },
  { label: "منح الدكتوراه", change: { level: ["PHD"] } },
  { label: "منح ممولة بالكامل", change: { funding: ["FULL"] } },
];

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const where = buildWhere(filters);
  const page = filters.page ?? 1;

  const user = await getCurrentUser();

  const [total, rows, countryGroups, majorGroups, savedRows] = await Promise.all([
    prisma.scholarship.count({ where }),
    prisma.scholarship.findMany({
      where,
      orderBy: buildOrderBy(filters.sort),
      ...paginationArgs(page),
      include: { levels: true, majors: true },
    }),
    prisma.scholarship.groupBy({
      by: ["countryCode", "countryNameAr"],
      where: { status: "PUBLISHED" },
      _count: { _all: true },
      orderBy: { _count: { countryCode: "desc" } },
    }),
    prisma.scholarshipMajor.groupBy({
      by: ["name"],
      _count: { _all: true },
      orderBy: { _count: { name: "desc" } },
      take: 12,
    }),
    user
      ? prisma.savedScholarship.findMany({
          where: { userId: user.id },
          select: { scholarshipId: true },
        })
      : Promise.resolve([]),
  ]);

  const savedIds = new Set(savedRows.map((r) => r.scholarshipId));

  // نسب المطابقة تُحسب فقط للمستخدم المسجّل صاحب ملف أكاديمي
  const profile = user
    ? await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: { educations: true, skills: true, languages: true, interests: true },
      })
    : null;

  let results = rows.map((s) => ({
    scholarship: s,
    score: profile ? computeMatch(profile, s).score : null,
  }));

  if (filters.sort === "match" && profile) {
    results = [...results].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countryNames = Object.fromEntries(
    countryGroups.map((g) => [g.countryCode, g.countryNameAr]),
  );

  return (
    <>
      {/* --- الترويسة والبحث --- */}
      <section className="border-b border-ink-200 bg-white">
        <div className="container-page py-12 text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-800 sm:text-4xl">
            اكتشف المنح
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[14.5px] leading-relaxed text-ink-500">
            استكشف آلاف المنح الدراسية المتاحة حول العالم. استخدم أدواتنا الذكية للعثور على المنحة
            المثالية التي تتناسب مع طموحك الأكاديمي وملفك الشخصي.
          </p>

          <form action="/scholarships" className="mx-auto mt-8 flex max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute inset-y-0 end-4 my-auto size-4 text-ink-400" />
              <input
                type="search"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="ابحث عن جامعة، دولة أو تخصص…"
                aria-label="البحث في المنح"
                className="h-12 w-full rounded-full border border-ink-300 bg-white ps-5 pe-11 text-sm text-ink-900 placeholder:text-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/15"
              />
            </div>
            <Button type="submit" size="lg" className="rounded-full px-7">
              بحث
            </Button>
          </form>

          <ul className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {QUICK_FILTERS.map((quick) => (
              <li key={quick.label}>
                <Link
                  href={buildFilterHref("/scholarships", filters, {
                    ...quick.change,
                    page: undefined,
                  })}
                  className="rounded-full border border-ink-200 bg-ink-50 px-3.5 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-navy-300 hover:bg-navy-50 hover:text-navy-700"
                >
                  {quick.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- النتائج --- */}
      <section className="container-page py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <FiltersSidebar
            filters={filters}
            countries={countryGroups.map((g) => ({
              code: g.countryCode,
              name: g.countryNameAr,
              count: g._count._all,
            }))}
            majors={majorGroups.map((g) => ({ name: g.name, count: g._count._all }))}
          />

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[15px] font-bold text-ink-900">
                  <span className="num">{formatNumber(total)}</span> منحة متاحة
                </h2>
                <ActiveFilters filters={filters} countryNames={countryNames} />
              </div>
              <SortSelect value={filters.sort ?? "newest"} />
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-ink-200 bg-white">
                <EmptyState
                  title="لا توجد منح مطابقة"
                  description="جرّب توسيع معايير البحث أو إزالة بعض الفلاتر المفعّلة."
                  action={
                    <Link
                      href="/scholarships"
                      className="inline-flex h-11 items-center rounded-[10px] bg-gold-400 px-6 text-sm font-bold text-navy-900 hover:bg-gold-300"
                    >
                      مسح كل الفلاتر
                    </Link>
                  }
                />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {results.map(({ scholarship, score }) => (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      saved={savedIds.has(scholarship.id)}
                      matchScore={score}
                      showSave={Boolean(user)}
                    />
                  ))}
                </div>

                <Pagination
                  className="mt-10"
                  page={page}
                  totalPages={totalPages}
                  buildHref={(p) =>
                    buildFilterHref("/scholarships", filters, { page: p === 1 ? undefined : String(p) })
                  }
                />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
