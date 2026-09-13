"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, Check, Mail, UserRound, X } from "lucide-react";

import { registerAction } from "@/app/(auth)/actions";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Input, PasswordInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { SocialButtons } from "@/components/auth/social-buttons";
import { cn } from "@/lib/utils";

const RULES = [
  { test: (v: string) => v.length >= 8, label: "لا تقل عن 8 أحرف" },
  { test: (v: string) => /[A-Z]/.test(v) && /[0-9]/.test(v), label: "أحرف كبيرة وأرقام" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "رمز واحد على الأقل" },
];

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, EMPTY_FORM_STATE);
  const [password, setPassword] = useState("");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <Input
        name="fullName"
        label="الاسم الكامل"
        placeholder="الاسم الكامل"
        autoComplete="name"
        required
        icon={<UserRound className="size-4" />}
        error={state.errors?.fullName}
      />

      <Input
        name="email"
        type="email"
        label="البريد الإلكتروني"
        placeholder="example@gmail.com"
        autoComplete="email"
        required
        icon={<Mail className="size-4" />}
        error={state.errors?.email}
      />

      <PasswordInput
        name="password"
        label="كلمة المرور"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={state.errors?.password}
      />

      <PasswordInput
        name="confirmPassword"
        label="تأكيد كلمة المرور"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        error={state.errors?.confirmPassword}
      />

      {/* شروط كلمة المرور — تتحقّق حيّاً أثناء الكتابة */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
        {RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li
              key={rule.label}
              className={cn(
                "flex items-center gap-1.5 text-[11.5px] transition-colors",
                password.length === 0
                  ? "text-ink-400"
                  : passed
                    ? "text-[color:var(--color-success)]"
                    : "text-ink-400",
              )}
            >
              {password.length > 0 && passed ? (
                <Check className="size-3" />
              ) : password.length > 0 ? (
                <X className="size-3" />
              ) : (
                <span className="size-1 rounded-full bg-current" />
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>

      <Checkbox
        name="acceptTerms"
        required
        error={state.errors?.acceptTerms}
        label={
          <>
            أوافق على{" "}
            <Link href="/terms" className="font-semibold text-navy-600 hover:underline">
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link href="/privacy" className="font-semibold text-navy-600 hover:underline">
              سياسة الخصوصية
            </Link>
          </>
        }
      />

      <SubmitButton fullWidth size="lg" pendingText="جارٍ إنشاء الحساب…">
        إنشاء الحساب
        <ArrowLeft className="size-4" />
      </SubmitButton>

      <p className="text-center text-[13px] text-ink-500">
        لديك حساب بالفعل؟{" "}
        <Link href="/login" className="font-bold text-navy-700 hover:underline">
          تسجيل الدخول
        </Link>
      </p>

      <div className="flex items-center gap-3 pt-1">
        <span className="h-px flex-1 bg-ink-200" />
        <span className="text-[11px] text-ink-400">أو تابع باستخدام</span>
        <span className="h-px flex-1 bg-ink-200" />
      </div>

      <SocialButtons />
    </form>
  );
}
