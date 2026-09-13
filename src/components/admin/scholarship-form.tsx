"use client";

import { useActionState } from "react";
import type { DegreeLevel } from "@prisma/client";

import { saveScholarshipAction } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { DEGREE_LABELS, FUNDING_LABELS, LANGUAGE_REQ_LABELS } from "@/lib/constants";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export type ScholarshipFormValues = {
  id?: string;
  titleAr: string;
  titleEn: string;
  provider: string;
  universityName: string;
  countryCode: string;
  countryNameAr: string;
  region: string;
  fundingType: string;
  languageRequirement: string;
  status: string;
  description: string;
  applyUrl: string;
  openDate: string;
  deadline: string;
  minGpa: string;
  gpaScale: string;
  acceptanceRate: string;
  isFeatured: boolean;
  levels: DegreeLevel[];
  majors: string;
  eligibility: string;
  documents: string;
  benefits: string;
};

export function ScholarshipForm({ values }: { values: ScholarshipFormValues }) {
  const [state, formAction] = useActionState(saveScholarshipAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}

      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      {/* ---------- البيانات الأساسية ---------- */}
      <Card>
        <CardHeader title="البيانات الأساسية" />
        <CardBody className="grid gap-4 pt-4 sm:grid-cols-2">
          <Input
            name="titleAr"
            label="اسم المنحة بالعربية"
            required
            defaultValue={values.titleAr}
            error={state.errors?.titleAr}
          />
          <Input
            name="titleEn"
            label="اسم المنحة بالإنجليزية"
            dir="ltr"
            defaultValue={values.titleEn}
            error={state.errors?.titleEn}
          />
          <Input
            name="provider"
            label="الجهة المانحة"
            required
            defaultValue={values.provider}
            error={state.errors?.provider}
          />
          <Input
            name="universityName"
            label="الجامعة (اختياري)"
            defaultValue={values.universityName}
          />
          <Input
            name="countryCode"
            label="رمز الدولة (حرفان)"
            required
            maxLength={2}
            dir="ltr"
            placeholder="TR"
            defaultValue={values.countryCode}
            error={state.errors?.countryCode}
            hint="مثال: TR لتركيا، DE لألمانيا، EU للاتحاد الأوروبي."
          />
          <Input
            name="countryNameAr"
            label="اسم الدولة بالعربية"
            required
            defaultValue={values.countryNameAr}
            error={state.errors?.countryNameAr}
          />
          <Input name="region" label="المنطقة" defaultValue={values.region} placeholder="أوروبا" />
          <Input
            name="applyUrl"
            label="رابط التقديم الرسمي"
            dir="ltr"
            defaultValue={values.applyUrl}
            error={state.errors?.applyUrl}
          />
        </CardBody>
      </Card>

      {/* ---------- التصنيف والحالة ---------- */}
      <Card>
        <CardHeader title="التصنيف والحالة" />
        <CardBody className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select name="fundingType" label="نوع التمويل" required defaultValue={values.fundingType}>
              {Object.entries(FUNDING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              name="languageRequirement"
              label="متطلبات اللغة"
              required
              defaultValue={values.languageRequirement}
            >
              {Object.entries(LANGUAGE_REQ_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Select name="status" label="حالة النشر" required defaultValue={values.status}>
              <option value="DRAFT">مسودة</option>
              <option value="PENDING_REVIEW">بانتظار المراجعة</option>
              <option value="PUBLISHED">منشورة</option>
              <option value="EXPIRED">منتهية</option>
              <option value="ARCHIVED">مؤرشفة</option>
            </Select>
          </div>

          <fieldset>
            <legend className="mb-2 text-[13px] font-semibold text-ink-800">
              مستويات الدراسة <span className="text-danger">*</span>
            </legend>
            <div className="flex flex-wrap gap-4">
              {(Object.keys(DEGREE_LABELS) as DegreeLevel[]).map((level) => (
                <Checkbox
                  key={level}
                  name="levels"
                  value={level}
                  defaultChecked={values.levels.includes(level)}
                  label={DEGREE_LABELS[level]}
                />
              ))}
            </div>
            {state.errors?.levels && (
              <p className="mt-1.5 text-[12px] font-medium text-danger">{state.errors.levels}</p>
            )}
          </fieldset>

          <Checkbox
            name="isFeatured"
            defaultChecked={values.isFeatured}
            label="عرض المنحة ضمن المنح المميّزة في الصفحة الرئيسية"
          />
        </CardBody>
      </Card>

      {/* ---------- المواعيد والمعايير ---------- */}
      <Card>
        <CardHeader title="المواعيد ومعايير القبول" />
        <CardBody className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input name="openDate" type="date" label="تاريخ فتح التقديم" defaultValue={values.openDate} />
          <Input name="deadline" type="date" label="الموعد النهائي" defaultValue={values.deadline} />
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="minGpa"
              type="number"
              step="0.01"
              label="الحد الأدنى للمعدل"
              defaultValue={values.minGpa}
            />
            <Select name="gpaScale" label="النظام" defaultValue={values.gpaScale || "4"}>
              <option value="4">من 4</option>
              <option value="5">من 5</option>
              <option value="100">من 100</option>
            </Select>
          </div>
          <Input
            name="acceptanceRate"
            type="number"
            step="0.1"
            label="معدل القبول (%)"
            defaultValue={values.acceptanceRate}
          />
        </CardBody>
      </Card>

      {/* ---------- المحتوى ---------- */}
      <Card>
        <CardHeader
          title="محتوى صفحة المنحة"
          subtitle="كل سطر يمثّل عنصراً مستقلاً في القائمة."
        />
        <CardBody className="space-y-4 pt-4">
          <Textarea
            name="description"
            label="نبذة عن المنحة"
            rows={5}
            defaultValue={values.description}
          />

          <Textarea
            name="majors"
            label="التخصصات المطلوبة"
            rows={4}
            defaultValue={values.majors}
            hint="تخصص واحد في كل سطر."
          />

          <Textarea
            name="eligibility"
            label="شروط الأهلية"
            rows={5}
            defaultValue={values.eligibility}
            hint="شرط واحد في كل سطر."
          />

          <Textarea
            name="documents"
            label="المستندات المطلوبة"
            rows={5}
            defaultValue={values.documents}
            hint="صيغة كل سطر: اسم المستند | ملاحظة — مثال: السيرة الذاتية (CV) | PDF"
          />

          <Textarea
            name="benefits"
            label="المزايا والتمويل"
            rows={4}
            defaultValue={values.benefits}
            hint="صيغة كل سطر: العنوان | الوصف — مثال: تغطية كاملة | إعفاء من الرسوم طوال البرنامج"
          />
        </CardBody>
      </Card>

      <div className="flex gap-3">
        <SubmitButton size="lg" pendingText="جارٍ الحفظ…">
          {values.id ? "حفظ التعديلات" : "إنشاء المنحة"}
        </SubmitButton>
      </div>
    </form>
  );
}
