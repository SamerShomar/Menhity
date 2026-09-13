import Link from "next/link";
import { X } from "lucide-react";

import { DEGREE_LABELS, FUNDING_LABELS, LANGUAGE_REQ_LABELS } from "@/lib/constants";
import {
  buildFilterHref,
  toggleValue,
  type ScholarshipFilters,
} from "@/lib/scholarship-query";

type Chip = { key: keyof ScholarshipFilters; value: string; label: string };

export function ActiveFilters({
  filters,
  countryNames,
}: {
  filters: ScholarshipFilters;
  countryNames: Record<string, string>;
}) {
  const chips: Chip[] = [];

  if (filters.q) chips.push({ key: "q", value: filters.q, label: `بحث: ${filters.q}` });

  for (const code of filters.country ?? [])
    chips.push({ key: "country", value: code, label: countryNames[code] ?? code });

  for (const level of filters.level ?? [])
    chips.push({
      key: "level",
      value: level,
      label: DEGREE_LABELS[level as keyof typeof DEGREE_LABELS] ?? level,
    });

  for (const major of filters.major ?? [])
    chips.push({ key: "major", value: major, label: major });

  for (const funding of filters.funding ?? [])
    chips.push({
      key: "funding",
      value: funding,
      label: FUNDING_LABELS[funding as keyof typeof FUNDING_LABELS] ?? funding,
    });

  for (const language of filters.language ?? [])
    chips.push({
      key: "language",
      value: language,
      label: LANGUAGE_REQ_LABELS[language as keyof typeof LANGUAGE_REQ_LABELS] ?? language,
    });

  if (chips.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const href =
          chip.key === "q"
            ? buildFilterHref("/scholarships", filters, { q: undefined, page: undefined })
            : buildFilterHref("/scholarships", filters, {
                [chip.key]: toggleValue(filters[chip.key] as string[], chip.value),
                page: undefined,
              });

        return (
          <li key={`${chip.key}-${chip.value}`}>
            <Link
              href={href}
              className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-navy-50 px-2.5 py-1 text-[11.5px] font-semibold text-navy-700 transition-colors hover:bg-navy-100"
            >
              {chip.label}
              <X className="size-3" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
