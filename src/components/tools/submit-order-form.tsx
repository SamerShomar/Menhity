"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";

import { submitCvOrderAction } from "@/app/actions/cv-order";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";

export function SubmitOrderForm({ disabled }: { disabled?: boolean }) {
  const [state, formAction] = useActionState(submitCvOrderAction, EMPTY_FORM_STATE);

  return (
    <form action={formAction} className="space-y-3">
      {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

      <SubmitButton
        size="lg"
        fullWidth
        disabled={disabled}
        pendingText="جارٍ إرسال الطلب…"
      >
        <Send className="size-4" />
        إرسال الطلب إلى خبير أكاديمي
      </SubmitButton>

      <p className="text-center text-[11.5px] text-ink-400">
        سيتم تحويل بياناتك إلى خبير مختص لمراجعة وصياغة سيرتك الذاتية يدوياً.
      </p>
    </form>
  );
}
