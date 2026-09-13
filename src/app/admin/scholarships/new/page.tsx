import type { Metadata } from "next";

import { requireRole } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ScholarshipForm } from "@/components/admin/scholarship-form";

export const metadata: Metadata = { title: "إضافة منحة جديدة" };

export default async function NewScholarshipPage() {
  await requireRole("ADMIN", "MODERATOR");

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="إضافة منحة جديدة"
        description="أدخل بيانات المنحة كاملة — يمكنك حفظها كمسودة ومراجعتها لاحقاً قبل النشر."
      />

      <ScholarshipForm
        values={{
          titleAr: "",
          titleEn: "",
          provider: "",
          universityName: "",
          countryCode: "",
          countryNameAr: "",
          region: "",
          fundingType: "FULL",
          languageRequirement: "NOT_REQUIRED",
          status: "DRAFT",
          description: "",
          applyUrl: "",
          openDate: "",
          deadline: "",
          minGpa: "",
          gpaScale: "4",
          acceptanceRate: "",
          isFeatured: false,
          levels: ["MASTER"],
          majors: "",
          eligibility: "",
          documents: "",
          benefits: "",
        }}
      />
    </div>
  );
}
