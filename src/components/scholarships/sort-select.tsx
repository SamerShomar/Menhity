"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SORT_OPTIONS } from "@/lib/constants";

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "newest") params.delete("sort");
    else params.set("sort", next);
    params.delete("page");

    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  return (
    <label className="flex items-center gap-2 text-[12.5px] text-ink-500">
      ترتيب حسب:
      <select
        value={value}
        disabled={pending}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer rounded-lg border border-ink-300 bg-white px-3 text-[12.5px] font-semibold text-ink-800 focus:border-navy-500 focus:outline-none disabled:opacity-60"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
