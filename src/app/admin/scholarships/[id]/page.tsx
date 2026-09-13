import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Trash2 } from "lucide-react";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteScholarshipAction } from "@/app/actions/admin";

import { AdminPageHeader } from "@/components/admin/page-header";
import { ScholarshipForm } from "@/components/admin/scholarship-form";

export const metadata: Metadata = { title: "تعديل المنحة" };

function toDateInput(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}

export default async function EditScholarshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("ADMIN", "MODERATOR");
  const { id } = await params;

  const scholarship = await prisma.scholarship.findUnique({
    where: { id },
    include: {
      levels: true,
      majors: true,
      eligibility: { orderBy: { sortOrder: "asc" } },
      documents: { orderBy: { sortOrder: "asc" } },
      benefits: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!scholarship) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="تعديل المنحة"
        description={scholarship.titleAr}
        actions={
          <>
            <Link
              href={`/scholarships/${scholarship.slug}`}
              target="_blank"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink-300 bg-white px-3.5 text-[13px] font-semibold text-ink-600 hover:border-navy-300 hover:text-navy-700"
            >
              <ExternalLink className="size-4" />
              معاينة
            </Link>

            {user.role === "ADMIN" && (
              <form action={deleteScholarshipAction}>
                <input type="hidden" name="id" value={scholarship.id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3.5 text-[13px] font-semibold text-danger hover:bg-danger-soft"
                >
                  <Trash2 className="size-4" />
                  حذف
                </button>
              </form>
            )}
          </>
        }
      />

      <ScholarshipForm
        values={{
          id: scholarship.id,
          titleAr: scholarship.titleAr,
          titleEn: scholarship.titleEn ?? "",
          provider: scholarship.provider,
          universityName: scholarship.universityName ?? "",
          countryCode: scholarship.countryCode,
          countryNameAr: scholarship.countryNameAr,
          region: scholarship.region ?? "",
          fundingType: scholarship.fundingType,
          languageRequirement: scholarship.languageRequirement,
          status: scholarship.status,
          description: scholarship.description ?? "",
          applyUrl: scholarship.applyUrl ?? "",
          openDate: toDateInput(scholarship.openDate),
          deadline: toDateInput(scholarship.deadline),
          minGpa: scholarship.minGpa?.toString() ?? "",
          gpaScale: scholarship.gpaScale?.toString() ?? "4",
          acceptanceRate: scholarship.acceptanceRate?.toString() ?? "",
          isFeatured: scholarship.isFeatured,
          levels: scholarship.levels.map((l) => l.level),
          majors: scholarship.majors.map((m) => m.name).join("\n"),
          eligibility: scholarship.eligibility.map((e) => e.text).join("\n"),
          documents: scholarship.documents
            .map((d) => (d.note ? `${d.name} | ${d.note}` : d.name))
            .join("\n"),
          benefits: scholarship.benefits
            .map((b) => (b.description ? `${b.title} | ${b.description}` : b.title))
            .join("\n"),
        }}
      />
    </div>
  );
}
