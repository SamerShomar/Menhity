"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { Plus, Sparkles, X } from "lucide-react";

import {
  addInterestAction,
  addSkillAction,
  saveCertificationAction,
  saveEducationAction,
  saveExperienceAction,
  saveLanguageAction,
  saveProjectAction,
  updatePersonalInfoAction,
} from "@/app/actions/profile";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import {
  DEGREE_LABELS,
  EXPERIENCE_TYPE_LABELS,
  GPA_SCALES,
  LANGUAGE_PROFICIENCY,
} from "@/lib/constants";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

/* ============================================================
   غلاف نموذج قابل للطي — يُستخدم لكل أقسام "الإضافة"
   ============================================================ */

function Collapsible({
  label,
  children,
  openLabel,
}: {
  label: string;
  openLabel?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-3.5" />
        {label}
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-[13px] font-bold text-ink-800">{openLabel ?? label}</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="إلغاء"
          className="rounded-lg p-1 text-ink-400 hover:bg-white hover:text-ink-700"
        >
          <X className="size-4" />
        </button>
      </div>
      {children(() => setOpen(false))}
    </div>
  );
}

/** يغلق النموذج تلقائياً عند نجاح الحفظ */
function useCloseOnSuccess(ok: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (ok) closeRef.current();
  }, [ok]);
}

/* ============================================================
   المعلومات الشخصية
   ============================================================ */

export function PersonalInfoForm({
  defaults,
}: {
  defaults: {
    fullNameAr: string;
    fullNameEn: string;
    academicEmail: string;
    phone: string;
    birthDate: string;
    nationality: string;
    gender: string;
    country: string;
    city: string;
    linkedinUrl: string;
    portfolioUrl: string;
    bio: string;
  };
}) {
  const [state, formAction] = useActionState(updatePersonalInfoAction, EMPTY_FORM_STATE);
  const [bio, setBio] = useState(defaults.bio);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="fullNameAr"
          label="الاسم الكامل بالعربية (رباعي)"
          required
          defaultValue={defaults.fullNameAr}
          hint="يُدخل كما هو وارد في جواز السفر."
          error={state.errors?.fullNameAr}
        />
        <Input
          name="fullNameEn"
          label="الاسم الكامل بالإنجليزية (رباعي)"
          defaultValue={defaults.fullNameEn}
          dir="ltr"
          hint="يُكتب كما هو وارد في جواز السفر."
          error={state.errors?.fullNameEn}
        />
        <Input
          name="academicEmail"
          type="email"
          label="البريد الإلكتروني الأكاديمي / الرسمي"
          defaultValue={defaults.academicEmail}
          placeholder="ahmed.salem@example.com"
          error={state.errors?.academicEmail}
        />
        <Input
          name="phone"
          type="tel"
          label="رقم الهاتف (مع المفتاح الدولي)"
          defaultValue={defaults.phone}
          placeholder="+970 59 912 3456"
          error={state.errors?.phone}
        />
        <Input
          name="birthDate"
          type="date"
          label="تاريخ الميلاد"
          defaultValue={defaults.birthDate}
          error={state.errors?.birthDate}
        />
        <Input
          name="nationality"
          label="الجنسية"
          defaultValue={defaults.nationality}
          error={state.errors?.nationality}
        />
        <Select name="gender" label="الجنس" defaultValue={defaults.gender}>
          <option value="">غير محدّد</option>
          <option value="MALE">ذكر</option>
          <option value="FEMALE">أنثى</option>
        </Select>
        <Input name="country" label="الدولة" defaultValue={defaults.country} />
        <Input name="city" label="المدينة" defaultValue={defaults.city} />
        <Input
          name="linkedinUrl"
          label="رابط حساب لينكد إن (LinkedIn)"
          defaultValue={defaults.linkedinUrl}
          dir="ltr"
          placeholder="linkedin.com/in/username"
          error={state.errors?.linkedinUrl}
        />
        <Input
          name="portfolioUrl"
          label="رابط المعرض أو الموقع الشخصي (Portfolio)"
          defaultValue={defaults.portfolioUrl}
          dir="ltr"
          placeholder="example.dev"
          error={state.errors?.portfolioUrl}
        />
      </div>

      <Textarea
        name="bio"
        label="نبذة شخصية وأكاديمية عنك"
        rows={5}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="اذكر تخصصك، اهتماماتك البحثية، وهدفك من التقديم على المنح."
        hint="يُفضّل أن تكون بين 80 و300 كلمة، وصياغتها تركّز على الأثر الأكاديمي."
        counter={`${bio.trim() ? bio.trim().split(/\s+/).length : 0} كلمة`}
        error={state.errors?.bio}
      />

      <SubmitButton pendingText="جارٍ الحفظ…">حفظ المعلومات الشخصية</SubmitButton>
    </form>
  );
}

/* ============================================================
   التعليم
   ============================================================ */

export function AddEducationForm() {
  return (
    <Collapsible label="إضافة درجة علمية" openLabel="مؤهل تعليمي جديد">
      {(close) => <EducationFields close={close} />}
    </Collapsible>
  );
}

function EducationFields({ close }: { close: () => void }) {
  const [state, formAction] = useActionState(saveEducationAction, EMPTY_FORM_STATE);
  useCloseOnSuccess(state.ok, close);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="degree" label="الدرجة العلمية" required defaultValue="BACHELOR">
          {Object.entries(DEGREE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input name="major" label="التخصص الأكاديمي" placeholder="هندسة البرمجيات" />
        <Input
          name="institution"
          label="اسم الجامعة أو المؤسسة التعليمية"
          required
          error={state.errors?.institution}
        />
        <Input name="country" label="الدولة" />
        <Input
          name="graduationYear"
          type="number"
          inputMode="numeric"
          label="سنة التخرج أو المتوقعة"
          placeholder="2027"
          min={1950}
          max={2100}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="gpaValue"
            type="number"
            step="0.01"
            label="المعدل التراكمي"
            placeholder="3.88"
          />
          <Select name="gpaScale" label="نظام التقييم" defaultValue="4">
            {GPA_SCALES.map((scale) => (
              <option key={scale.value} value={scale.value}>
                {scale.label}
              </option>
            ))}
          </Select>
        </div>
        <Input name="honors" label="التقدير" placeholder="امتياز مع مرتبة الشرف" />
      </div>

      <Textarea
        name="thesisTitle"
        label="أطروحة التخرج أو المشاريع البحثية الأكاديمية (اختياري)"
        rows={3}
      />

      <Checkbox name="isCurrent" label="ما زلت أدرس في هذا المؤهل" />

      <div className="flex gap-2">
        <SubmitButton size="sm" pendingText="جارٍ الحفظ…">حفظ المؤهل</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={close}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

/* ============================================================
   الخبرات
   ============================================================ */

export function AddExperienceForm() {
  return (
    <Collapsible label="إضافة خبرة أخرى" openLabel="خبرة مهنية أو بحثية جديدة">
      {(close) => <ExperienceFields close={close} />}
    </Collapsible>
  );
}

function ExperienceFields({ close }: { close: () => void }) {
  const [state, formAction] = useActionState(saveExperienceAction, EMPTY_FORM_STATE);
  const [isCurrent, setIsCurrent] = useState(false);
  useCloseOnSuccess(state.ok, close);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="title"
          label="المسمى الوظيفي أو الدور الأكاديمي"
          required
          placeholder="مطوّر برمجيات متدرّب / باحث مساعد"
          error={state.errors?.title}
        />
        <Select name="type" label="نوع الخبرة" required defaultValue="JOB">
          {Object.entries(EXPERIENCE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Input
          name="organization"
          label="جهة العمل أو المؤسسة / المختبر"
          required
          error={state.errors?.organization}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input name="country" label="الدولة" />
          <Input name="city" label="المدينة" />
        </div>
        <Input name="startDate" type="date" label="تاريخ البدء" />
        <Input
          name="endDate"
          type="date"
          label="تاريخ الانتهاء"
          disabled={isCurrent}
          placeholder={isCurrent ? "حتى الآن" : undefined}
        />
      </div>

      <Checkbox
        name="isCurrent"
        label="ما زلت أعمل هنا (حتى الآن)"
        checked={isCurrent}
        onChange={(e) => setIsCurrent(e.target.checked)}
      />

      <Textarea
        name="description"
        label="وصف المهام والإنجازات والنتائج المحققة"
        rows={4}
        hint="ابدأ الجملة بفعل قوي واذكر أرقاماً ونتائج ملموسة."
      />

      <div className="flex gap-2">
        <SubmitButton size="sm" pendingText="جارٍ الحفظ…">حفظ الخبرة</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={close}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

/* ============================================================
   المهارات والاهتمامات — إدخال بالوسوم
   ============================================================ */

export function TagAdder({
  action,
  placeholder,
  suggestions = [],
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  placeholder: string;
  suggestions?: string[];
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <form
        ref={formRef}
        action={async (formData) => {
          await action(formData);
          formRef.current?.reset();
        }}
        className="flex gap-2"
      >
        <input
          ref={inputRef}
          name="name"
          placeholder={placeholder}
          aria-label={label}
          required
          className="h-10 flex-1 rounded-lg border border-ink-300 bg-white px-3 text-[13px] text-ink-900 placeholder:text-ink-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/15"
        />
        <SubmitButton size="sm" pendingText="…">
          <Plus className="size-3.5" />
          إضافة
        </SubmitButton>
      </form>

      {suggestions.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11.5px] font-semibold text-gold-700">
            <Sparkles className="size-3.5" />
            اقتراحات بناءً على تخصصك
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <form action={action}>
                  <input type="hidden" name="name" value={suggestion} />
                  <button
                    type="submit"
                    className="rounded-full border border-gold-300 bg-gold-50 px-2.5 py-1 text-[11.5px] font-semibold text-gold-800 transition-colors hover:bg-gold-100"
                  >
                    + {suggestion}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SkillAdder({ suggestions }: { suggestions: string[] }) {
  return (
    <TagAdder
      action={addSkillAction}
      label="إضافة مهارة"
      placeholder="اكتب المهارة ثم اضغط إضافة…"
      suggestions={suggestions}
    />
  );
}

export function InterestAdder() {
  return (
    <TagAdder
      action={addInterestAction}
      label="إضافة اهتمام"
      placeholder="مجال اهتمامك (مثل: الذكاء الاصطناعي)…"
    />
  );
}

/* ============================================================
   اللغات
   ============================================================ */

export function AddLanguageForm() {
  return (
    <Collapsible label="إضافة لغة" openLabel="لغة جديدة">
      {(close) => <LanguageFields close={close} />}
    </Collapsible>
  );
}

function LanguageFields({ close }: { close: () => void }) {
  const [state, formAction] = useActionState(saveLanguageAction, EMPTY_FORM_STATE);
  useCloseOnSuccess(state.ok, close);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Input name="name" label="اللغة" required placeholder="الإنجليزية" error={state.errors?.name} />
        <Select name="proficiency" label="مستوى الإتقان" required defaultValue={LANGUAGE_PROFICIENCY[2]}>
          {LANGUAGE_PROFICIENCY.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
        <Input name="certificate" label="الشهادة (اختياري)" placeholder="IELTS 7.5" />
      </div>

      <div className="flex gap-2">
        <SubmitButton size="sm" pendingText="جارٍ الحفظ…">حفظ اللغة</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={close}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

/* ============================================================
   الشهادات
   ============================================================ */

export function AddCertificationForm() {
  return (
    <Collapsible label="إضافة شهادة جديدة" openLabel="شهادة أو اعتماد جديد">
      {(close) => <CertificationFields close={close} />}
    </Collapsible>
  );
}

function CertificationFields({ close }: { close: () => void }) {
  const [state, formAction] = useActionState(saveCertificationAction, EMPTY_FORM_STATE);
  useCloseOnSuccess(state.ok, close);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="title"
          label="اسم الشهادة"
          required
          placeholder="شهادة محترف الذكاء الاصطناعي"
          error={state.errors?.title}
        />
        <Input name="issuer" label="الجهة المانحة" placeholder="Coursera" />
        <Input name="credentialId" label="رقم الاعتماد" placeholder="DL-AI-2024-6891" dir="ltr" />
        <Input name="issueDate" type="date" label="تاريخ الإصدار" />
      </div>

      <div className="flex gap-2">
        <SubmitButton size="sm" pendingText="جارٍ الحفظ…">حفظ الشهادة</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={close}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}

/* ============================================================
   المشاريع والإنجازات
   ============================================================ */

export function AddProjectForm() {
  return (
    <Collapsible label="إضافة مشروع أو إنجاز" openLabel="مشروع أو إنجاز مميّز">
      {(close) => <ProjectFields close={close} />}
    </Collapsible>
  );
}

function ProjectFields({ close }: { close: () => void }) {
  const [state, formAction] = useActionState(saveProjectAction, EMPTY_FORM_STATE);
  useCloseOnSuccess(state.ok, close);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <Input
        name="title"
        label="عنوان المشروع أو الإنجاز"
        required
        placeholder="مشروع تخرّج حائز على جائزة التميّز للابتكار الرقمي — 2024"
        error={state.errors?.title}
      />

      <Textarea
        name="description"
        label="وصف الأثر والنتائج المحققة"
        rows={4}
        hint="اذكر الأثر بالأرقام: عدد المستفيدين، نسبة التحسّن، الجوائز."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="year" type="number" label="السنة" placeholder="2024" min={1950} max={2100} />
        <Input name="url" label="رابط المشروع (اختياري)" dir="ltr" />
      </div>

      <div className="flex gap-2">
        <SubmitButton size="sm" pendingText="جارٍ الحفظ…">حفظ المشروع</SubmitButton>
        <Button type="button" variant="ghost" size="sm" onClick={close}>
          إلغاء
        </Button>
      </div>
    </form>
  );
}
