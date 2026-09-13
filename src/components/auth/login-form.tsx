"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Mail } from "lucide-react";

import { loginAction } from "@/app/(auth)/actions";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { Checkbox, Input, PasswordInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

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
        autoComplete="current-password"
        required
        error={state.errors?.password}
      />

      <div className="flex items-center justify-between gap-3 pt-0.5">
        <Checkbox name="remember" label="تذكّرني" defaultChecked />
        <Link
          href="/forgot-password"
          className="text-[12.5px] font-semibold text-navy-600 hover:text-navy-800 hover:underline"
        >
          هل نسيت كلمة المرور؟
        </Link>
      </div>

      <SubmitButton fullWidth size="lg" pendingText="جارٍ تسجيل الدخول…">
        تسجيل الدخول
      </SubmitButton>

      <p className="pt-1 text-center text-[13px] text-ink-500">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-bold text-navy-700 hover:underline">
          إنشاء حساب
        </Link>
      </p>
    </form>
  );
}
