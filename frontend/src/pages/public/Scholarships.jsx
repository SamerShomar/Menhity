import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { FilterPanel } from "@/components/scholarships/FilterPanel";
import { ScholarshipCard, ScholarshipCardSkeleton } from "@/components/scholarships/ScholarshipCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { scholarshipApi } from "@/api/endpoints";
import { useApi } from "@/hooks/useApi";
import { useSaved } from "@/hooks/useSaved";
import { QUICK_FILTERS, SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const LIST_KEYS = ["country", "level", "major", "funding", "language"];

/** يحوّل معاملات الرابط إلى كائن فلاتر بمصفوفات */
function readFilters(params) {
  const filters = { q: params.get("q") ?? "", sort: params.get("sort") ?? "newest" };

  LIST_KEYS.forEach((key) => {
    const raw = params.get(key);
    filters[key] = raw ? raw.split(",").filter(Boolean) : [];
  });

  return filters;
}

export default function ScholarshipsPage() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const page = Number(params.get("page") ?? 1);

  const [term, setTerm] = useState(filters.q);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isSaved, toggle } = useSaved();

  useEffect(() => setTerm(filters.q), [filters.q]);

  const query = useMemo(() => {
    const payload = { page, sort: filters.sort };
    if (filters.q) payload.q = filters.q;
    LIST_KEYS.forEach((key) => {
      if (filters[key].length) payload[key] = filters[key].join(",");
    });
    return payload;
  }, [filters, page]);

  const { data, loading, error } = useApi(() => scholarshipApi.list(query), [JSON.stringify(query)]);
  const { data: facets } = useApi(scholarshipApi.facets, []);

  /** يكتب الفلاتر في الرابط ويعيد الترقيم للصفحة الأولى */
  const write = useCallback(
    (next) => {
      const search = new URLSearchParams();

      if (next.q) search.set("q", next.q);
      if (next.sort && next.sort !== "newest") search.set("sort", next.sort);
      LIST_KEYS.forEach((key) => {
        if (next[key]?.length) search.set(key, next[key].join(","));
      });
      if (next.page && next.page > 1) search.set("page", String(next.page));

      setParams(search);
    },
    [setParams],
  );

  const onToggleFilter = (key, value) => {
    const current = filters[key];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    write({ ...filters, [key]: next });
  };

  const onQuickFilter = (quick) => {
    const next = { ...filters };
    Object.entries(quick.params).forEach(([key, value]) => {
      next[key] = next[key].includes(value) ? next[key].filter((item) => item !== value) : [...next[key], value];
    });
    write(next);
  };

  const isQuickActive = (quick) =>
    Object.entries(quick.params).every(([key, value]) => filters[key]?.includes(value));

  const items = data?.data ?? [];
  const meta = data?.meta;
  const activeChips = LIST_KEYS.flatMap((key) => filters[key].map((value) => ({ key, value })));

  return (
    <div className="bg-ink-100 py-8">
      <div className="container-page">
        {/* العنوان والبحث */}
        <header className="rounded-2xl bg-navy-700 p-6 text-white sm:p-8">
          <h1 className="font-display text-2xl sm:text-3xl">اكتشف المنح الدراسية</h1>
          <p className="mt-2 text-sm text-navy-100 sm:text-base">
            ابحث بين المنح المتاحة وصفِّها حسب مرحلتك وتخصصك والدولة التي تريد الدراسة فيها.
          </p>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              write({ ...filters, q: term.trim() });
            }}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 start-3.5 size-5 -translate-y-1/2 text-ink-400" />
              <input
                type="search"
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="ابحث باسم المنحة أو الجهة المانحة أو التخصص…"
                aria-label="البحث في المنح"
                className="h-12 w-full rounded-xl border-0 bg-white ps-11 pe-4 text-sm text-ink-800 placeholder:text-ink-400 focus:ring-2 focus:ring-gold-400 focus:outline-none"
              />
            </div>
            <Button type="submit" variant="gold" size="lg">
              بحث
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_FILTERS.map((quick) => (
              <button
                key={quick.label}
                type="button"
                onClick={() => onQuickFilter(quick)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition",
                  isQuickActive(quick)
                    ? "bg-gold-400 text-navy-900"
                    : "bg-white/10 text-navy-50 hover:bg-white/20",
                )}
              >
                {quick.label}
              </button>
            ))}
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* الفلاتر — عمود ثابت على الشاشات الكبيرة */}
          <FilterPanel
            className="hidden h-fit lg:block"
            filters={filters}
            facets={facets}
            onToggle={onToggleFilter}
            onReset={() => write({ q: filters.q, sort: filters.sort })}
          />

          <div>
            {/* شريط الأدوات */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-ink-200">
              <p className="text-sm text-ink-600">
                {loading ? (
                  "جارٍ البحث…"
                ) : (
                  <>
                    <span className="num font-bold text-navy-700">{meta?.total ?? 0}</span> منحة متاحة
                  </>
                )}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setDrawerOpen(true)}
                >
                  <SlidersHorizontal className="size-4" />
                  الفلاتر
                </Button>

                <label className="flex items-center gap-2 text-[13px] text-ink-500">
                  ترتيب حسب
                  <select
                    value={filters.sort}
                    onChange={(event) => write({ ...filters, sort: event.target.value })}
                    className="h-9 rounded-lg border border-ink-300 bg-white px-2.5 text-[13px] font-semibold text-ink-800 focus:border-navy-500 focus:outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* الفلاتر المفعّلة */}
            {activeChips.length > 0 ? (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={`${chip.key}-${chip.value}`}
                    type="button"
                    onClick={() => onToggleFilter(chip.key, chip.value)}
                    className="flex items-center gap-1.5 rounded-full bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-700 hover:bg-navy-100"
                  >
                    {chip.value}
                    <X className="size-3.5" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => write({ q: filters.q, sort: filters.sort })}
                  className="text-xs font-semibold text-ink-500 underline hover:text-[color:var(--color-danger)]"
                >
                  مسح الكل
                </button>
              </div>
            ) : null}

            {error ? <Alert tone="danger">{error}</Alert> : null}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ScholarshipCardSkeleton key={index} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                title="لا توجد منح مطابقة"
                description="جرّب توسيع نطاق البحث أو إزالة بعض الفلاتر."
                action={
                  <Button variant="outline" onClick={() => write({ sort: "newest" })}>
                    إعادة تعيين البحث
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <ScholarshipCard
                    key={item.id}
                    scholarship={item}
                    saved={isSaved(item.slug)}
                    onToggleSave={toggle}
                  />
                ))}
              </div>
            )}

            {meta && meta.last_page > 1 ? (
              <Pagination
                className="mt-8"
                page={meta.current_page}
                totalPages={meta.last_page}
                onChange={(nextPage) => {
                  write({ ...filters, page: nextPage });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* درج الفلاتر على الجوال */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/50"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 end-0 w-[86%] max-w-sm overflow-y-auto bg-ink-100 p-4">
            <div className="mb-3 flex justify-end">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="إغلاق الفلاتر"
                className="grid size-9 place-items-center rounded-lg bg-white text-ink-500 ring-1 ring-ink-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <FilterPanel
              filters={filters}
              facets={facets}
              onToggle={onToggleFilter}
              onReset={() => write({ q: filters.q, sort: filters.sort })}
            />

            <Button className="mt-4 w-full" onClick={() => setDrawerOpen(false)}>
              عرض النتائج
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
