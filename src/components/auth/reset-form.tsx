"use client";

import { useActionState } from "react";

import { resetPasswordAction } from "@/app/(auth)/actions";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function ResetPasswordForm({ email, code }: { email: string; code: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="code" value={code} />

      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <PasswordInput
        name="password"
        label="كلمة المرور الجديدة"
        placeholder="••••••••"
        autoComplete="new-password"
        required
        hint="8 أحرف على الأقل، مع حرف كبير ورقم ورمز."
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

      <SubmitButton fullWidth size="lg" pendingText="جارٍ الحفظ…">
        حفظ كلمة المرور الجديدة
      </SubmitButton>
    </form>
  );
}
