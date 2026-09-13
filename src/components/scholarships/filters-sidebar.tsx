import Link from "next/link";
import { Check, SlidersHorizontal } from "lucide-react";

import {
  DEGREE_LABELS,
  FILTERABLE_DEGREES,
  FUNDING_LABELS,
  LANGUAGE_REQ_LABELS,
} from "@/lib/constants";
import {
  buildFilterHref,
  countActiveFilters,
  toggleValue,
  type ScholarshipFilters,
} from "@/lib/scholarship-query";
import { cn, countryFlag } from "@/lib/utils";

type Option = { value: string; label: string; count?: number; prefix?: string };

/**
 * سايدبار التصفية — مبني على روابط بدل حالة جافاسكربت،
 * فيعمل حتى بدون تفعيل JS ويبقى قابلاً للمشاركة عبر الرابط.
 */
export function FiltersSidebar({
  filters,
  countries,
  majors,
}: {
  filters: ScholarshipFilters;
  countries: { code: string; name: string; count: number }[];
  majors: { name: string; count: number }[];
}) {
  const active = countActiveFilters(filters);

  return (
    <aside className="lg:sticky lg:top-20 lg:h-fit">
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between border-b border-ink-100 pb-3.5">
          <h2 className="flex items-center gap-2 text-[14px] font-bold text-ink-900">
            <SlidersHorizontal className="size-4 text-navy-600" />
            تصفية النتائج
          </h2>
          {active > 0 && (
            <Link
              href="/scholarships"
              className="text-[12px] font-semibold text-danger hover:underline"
            >
              مسح الكل
            </Link>
          )}
        </div>

        <div className="space-y-5">
          <FilterGroup
            title="الدولة"
            filters={filters}
            paramKey="country"
            options={countries.map((c) => ({
              value: c.code,
              label: c.name,
              count: c.count,
              prefix: countryFlag(c.code),
            }))}
          />

          <FilterGroup
            title="مستوى الدراسة"
            filters={filters}
            paramKey="level"
            options={FILTERABLE_DEGREES.map((d) => ({ value: d, label: DEGREE_LABELS[d] }))}
          />

          <FilterGroup
            title="التخصص"
            filters={filters}
            paramKey="major"
            options={majors.map((m) => ({ value: m.name, label: m.name, count: m.count }))}
            maxVisible={8}
          />

          <FilterGroup
            title="نوع التمويل"
            filters={filters}
            paramKey="funding"
            options={(["FULL", "PARTIAL", "TUITION_ONLY"] as const).map((f) => ({
              value: f,
              label: FUNDING_LABELS[f],
            }))}
          />

          <FilterGroup
            title="متطلبات اللغة"
            filters={filters}
            paramKey="language"
            options={(["REQUIRED", "NOT_REQUIRED"] as const).map((l) => ({
              value: l,
              label: LANGUAGE_REQ_LABELS[l],
            }))}
          />
        </div>
      </div>
    </aside>
  );
}

function FilterGroup({
  title,
  options,
  paramKey,
  filters,
  maxVisible,
}: {
  title: string;
  options: Option[];
  paramKey: "country" | "level" | "major" | "funding" | "language";
  filters: ScholarshipFilters;
  maxVisible?: number;
}) {
  if (options.length === 0) return null;

  const selected = filters[paramKey] ?? [];
  const visible = maxVisible ? options.slice(0, maxVisible) : options;

  return (
    <div className="border-b border-ink-100 pb-5 last:border-0 last:pb-0">
      <h3 className="mb-2.5 text-[13px] font-bold text-ink-800">{title}</h3>
      <ul className="space-y-1">
        {visible.map((option) => {
          const isOn = selected.includes(option.value);
          const href = buildFilterHref("/scholarships", filters, {
            [paramKey]: toggleValue(selected, option.value),
            page: undefined,
          });

          return (
            <li key={option.value}>
              <Link
                href={href}
                aria-pressed={isOn}
                className="group flex items-center gap-2.5 rounded-lg py-1.5 pe-1 ps-1 transition-colors hover:bg-ink-50"
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                    isOn
                      ? "border-navy-700 bg-navy-700 text-white"
                      : "border-ink-300 bg-white group-hover:border-navy-400",
                  )}
                >
                  {isOn && <Check className="size-3" strokeWidth={3} />}
                </span>

                <span
                  className={cn(
                    "flex-1 truncate text-[12.5px]",
                    isOn ? "font-semibold text-navy-700" : "text-ink-600",
                  )}
                >
                  {option.prefix && <span className="me-1">{option.prefix}</span>}
                  {option.label}
                </span>

                {typeof option.count === "number" && (
                  <span className="num text-[11px] text-ink-400">{option.count}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
