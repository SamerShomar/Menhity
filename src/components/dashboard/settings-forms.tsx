"use client";

import { useActionState, useState } from "react";

import {
  changePasswordAction,
  updateLocaleAction,
  updateNotificationsAction,
  updatePrivacyAction,
} from "@/app/actions/settings";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { PasswordInput, Select, Switch } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

/* ---------- تغيير كلمة المرور ---------- */

export function ChangePasswordForm() {
  const [state, formAction] = useActionState(changePasswordAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && (
        <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>
      )}

      <PasswordInput
        name="currentPassword"
        label="كلمة المرور الحالية"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        error={state.errors?.currentPassword}
      />
      <PasswordInput
        name="newPassword"
        label="كلمة المرور الجديدة"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        error={state.errors?.newPassword}
      />
      <PasswordInput
        name="confirmPassword"
        label="تأكيد كلمة المرور الجديدة"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        error={state.errors?.confirmPassword}
      />

      <p className="text-[11.5px] leading-relaxed text-ink-400">
        كلمة المرور يجب أن تكون 8 أحرف على الأقل، وتحتوي على حرف كبير ورقم ورمز خاص.
      </p>

      <SubmitButton pendingText="جارٍ التحديث…">تحديث كلمة المرور</SubmitButton>
    </form>
  );
}

/* ---------- الخصوصية والأمان ---------- */

export function PrivacyForm({
  profileVisible,
  shareDataWithUniversities,
}: {
  profileVisible: boolean;
  shareDataWithUniversities: boolean;
}) {
  const [state, formAction] = useActionState(updatePrivacyAction, EMPTY_FORM_STATE);
  const [visible, setVisible] = useState(profileVisible);
  const [share, setShare] = useState(shareDataWithUniversities);

  return (
    <form action={formAction} className="space-y-1">
      {state.message && (
        <Alert tone={state.ok ? "success" : "danger"} className="mb-3">
          {state.message}
        </Alert>
      )}

      {visible && <input type="hidden" name="profileVisible" value="on" />}
      {share && <input type="hidden" name="shareDataWithUniversities" value="on" />}

      <Switch
        checked={visible}
        onChange={setVisible}
        label="ظهور الملف الشخصي"
        description="السماح للجامعات بالاطلاع على ملفك الشخصي."
      />
      <div className="border-t border-ink-100" />
      <Switch
        checked={share}
        onChange={setShare}
        label="مشاركة البيانات مع الجامعات"
        description="السماح للجامعات بالوصول إلى بياناتك الأكاديمية والوثائق المرفقة."
      />

      <div className="pt-3">
        <SubmitButton size="sm" pendingText="جارٍ الحفظ…">
          حفظ إعدادات الخصوصية
        </SubmitButton>
      </div>
    </form>
  );
}

/* ---------- تنبيهات البريد ---------- */

export function NotificationsForm({
  notifyNewMatches,
  notifyApplicationStatus,
  notifyNews,
}: {
  notifyNewMatches: boolean;
  notifyApplicationStatus: boolean;
  notifyNews: boolean;
}) {
  const [state, formAction] = useActionState(updateNotificationsAction, EMPTY_FORM_STATE);
  const [matches, setMatches] = useState(notifyNewMatches);
  const [status, setStatus] = useState(notifyApplicationStatus);
  const [news, setNews] = useState(notifyNews);

  return (
    <form action={formAction} className="space-y-1">
      {state.message && (
        <Alert tone={state.ok ? "success" : "danger"} className="mb-3">
          {state.message}
        </Alert>
      )}

      {matches && <input type="hidden" name="notifyNewMatches" value="on" />}
      {status && <input type="hidden" name="notifyApplicationStatus" value="on" />}
      {news && <input type="hidden" name="notifyNews" value="on" />}

      <Switch checked={matches} onChange={setMatches} label="تطابق منح جديدة" />
      <div className="border-t border-ink-100" />
      <Switch checked={status} onChange={setStatus} label="تحديثات حالة الطلب" />
      <div className="border-t border-ink-100" />
      <Switch checked={news} onChange={setNews} label="أخبار وتحديثات المنصة" />

      <div className="pt-3">
        <SubmitButton size="sm" pendingText="جارٍ الحفظ…">
          حفظ التفضيلات
        </SubmitButton>
      </div>
    </form>
  );
}

/* ---------- اللغة والمنطقة ---------- */

const TIMEZONES = [
  { value: "Asia/Riyadh", label: "توقيت السعودية (AST)" },
  { value: "Asia/Gaza", label: "توقيت فلسطين (EET)" },
  { value: "Africa/Cairo", label: "توقيت مصر (EET)" },
  { value: "Asia/Amman", label: "توقيت الأردن (EET)" },
  { value: "Asia/Dubai", label: "توقيت الإمارات (GST)" },
  { value: "Europe/Istanbul", label: "توقيت تركيا (TRT)" },
  { value: "Europe/Berlin", label: "توقيت وسط أوروبا (CET)" },
  { value: "Europe/London", label: "توقيت بريطانيا (GMT)" },
];

export function LocaleForm({ locale, timezone }: { locale: string; timezone: string }) {
  const [state, formAction] = useActionState(updateLocaleAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>
      )}

      <Select name="locale" label="لغة الواجهة" defaultValue={locale}>
        <option value="ar">العربية (Arabic)</option>
        <option value="en">الإنجليزية (English)</option>
      </Select>

      <Select name="timezone" label="المنطقة الزمنية" defaultValue={timezone}>
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </Select>

      <SubmitButton variant="outline" fullWidth pendingText="جارٍ الحفظ…">
        حفظ التغييرات
      </SubmitButton>
    </form>
  );
}

/* ---------- منطقة الخطر: تأكيد الحذف ---------- */

export function DeleteAccountConfirm() {
  const [text, setText] = useState("");

  return (
    <>
      <input
        name="confirm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="اكتب: حذف"
        aria-label="تأكيد الحذف"
        className="mb-2 h-10 w-full rounded-lg border border-red-200 bg-white px-3 text-[13px] text-ink-900 placeholder:text-ink-400 focus:border-danger focus:outline-none"
      />
      <SubmitButton variant="danger" size="sm" fullWidth disabled={text.trim() !== "حذف"}>
        حذف الحساب نهائياً
      </SubmitButton>
    </>
  );
}
