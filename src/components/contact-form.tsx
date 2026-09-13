"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

import { sendContactAction } from "@/app/actions/contact";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactAction, EMPTY_FORM_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="الاسم" required error={state.errors?.name} />
        <Input
          name="email"
          type="email"
          label="البريد الإلكتروني"
          required
          error={state.errors?.email}
        />
      </div>

      <Input name="subject" label="الموضوع (اختياري)" placeholder="استفسار عن منحة" />

      <Textarea
        name="body"
        label="الرسالة"
        rows={6}
        required
        placeholder="اكتب استفسارك بالتفصيل…"
        error={state.errors?.body}
      />

      <SubmitButton size="lg" pendingText="جارٍ الإرسال…">
        <Send className="size-4" />
        إرسال الرسالة
      </SubmitButton>
    </form>
  );
}
