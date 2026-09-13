"use client";

import { useActionState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";

import { addOrderNoteAction } from "@/app/actions/cv-order";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function OrderNoteForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState(addOrderNoteAction, EMPTY_FORM_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />

      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}

      <Textarea
        name="body"
        label="إرسال ملاحظة خاصة للخبير"
        rows={3}
        placeholder="مثال: أرجو التركيز على خبرتي البحثية وإبراز مشروع التخرّج."
      />

      <SubmitButton size="sm" pendingText="جارٍ الإرسال…">
        <MessageSquare className="size-3.5" />
        إرسال الملاحظة
      </SubmitButton>
    </form>
  );
}
