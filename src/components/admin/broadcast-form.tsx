"use client";

import { useActionState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

import { broadcastNotificationAction } from "@/app/actions/admin";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { Input, Select, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

export function BroadcastForm({ counts }: { counts: { all: number; active: number } }) {
  const [state, formAction] = useActionState(broadcastNotificationAction, EMPTY_FORM_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.message && <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>}

      <Select name="audience" label="الفئة المستهدفة" defaultValue="active">
        <option value="active">الطلاب النشطون ({counts.active})</option>
        <option value="all">جميع الطلاب ({counts.all})</option>
      </Select>

      <Input name="title" label="عنوان الإشعار" required placeholder="منح جديدة أضيفت للمنصة" />

      <Textarea
        name="body"
        label="نص الإشعار"
        required
        rows={4}
        placeholder="أضفنا 12 منحة جديدة في تخصصات الهندسة وعلوم الحاسوب — تصفّحها الآن."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="actionLabel" label="نص زر الإجراء (اختياري)" placeholder="تصفّح المنح" />
        <Input name="actionUrl" label="رابط الإجراء (اختياري)" dir="ltr" placeholder="/scholarships" />
      </div>

      <SubmitButton pendingText="جارٍ الإرسال…">
        <Send className="size-4" />
        إرسال الإشعار
      </SubmitButton>
    </form>
  );
}
