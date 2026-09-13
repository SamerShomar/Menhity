"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Mail } from "lucide-react";

import { forgotPasswordAction } from "@/app/(auth)/actions";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
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

      <SubmitButton fullWidth size="lg" pendingText="جارٍ الإرسال…">
        إرسال رمز الاستعادة
      </SubmitButton>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-ink-500 transition-colors hover:text-navy-700"
      >
        <ArrowRight className="size-3.5" />
        العودة لتسجيل الدخول
      </Link>
    </form>
  );
}
