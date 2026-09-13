"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";

import { toggleSaveAction } from "@/app/actions/scholarships";
import { cn } from "@/lib/utils";

export function SaveButton({
  scholarshipId,
  saved,
  variant = "icon",
  className,
}: {
  scholarshipId: string;
  saved: boolean;
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);

  function onClick() {
    startTransition(async () => {
      setOptimisticSaved(!optimisticSaved);
      await toggleSaveAction(scholarshipId);
    });
  }

  if (variant === "labelled") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        aria-pressed={optimisticSaved}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border px-3.5 text-[13px] font-semibold transition-colors",
          optimisticSaved
            ? "border-navy-200 bg-navy-50 text-navy-700"
            : "border-ink-300 bg-white text-ink-600 hover:border-navy-300 hover:text-navy-700",
          className,
        )}
      >
        <Bookmark className={cn("size-4", optimisticSaved && "fill-current")} />
        {optimisticSaved ? "محفوظة" : "احفظ المنحة"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={optimisticSaved}
      aria-label={optimisticSaved ? "إزالة من المحفوظات" : "حفظ المنحة"}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg transition-colors",
        optimisticSaved
          ? "bg-navy-700 text-white"
          : "bg-white/90 text-ink-500 hover:bg-white hover:text-navy-700",
        className,
      )}
    >
      <Bookmark className={cn("size-4", optimisticSaved && "fill-current")} />
    </button>
  );
}
