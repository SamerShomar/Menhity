import type { ZodError } from "zod";

/** الحالة المشتركة لكل نماذج الخادم (Server Actions) */
export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** بيانات إضافية يعيدها الأكشن (مثل البريد للانتقال لخطوة التحقق) */
  data?: Record<string, string>;
};

export const EMPTY_FORM_STATE: FormState = { ok: false };

/** تحويل أخطاء zod إلى خريطة اسم الحقل ← الرسالة */
export function zodErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function fail(message: string, errors?: Record<string, string>): FormState {
  return { ok: false, message, errors };
}

export function succeed(message?: string, data?: Record<string, string>): FormState {
  return { ok: true, message, data };
}
