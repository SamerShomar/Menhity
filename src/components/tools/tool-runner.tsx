"use client";

import { useActionState, useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";

import { runToolAction, type AiFormState } from "@/app/actions/ai-tools";
import { Alert } from "@/components/ui/alert";
import { Input, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const INITIAL: AiFormState = { ok: false };

export function ToolRunner({
  toolKey,
  needsText,
  textLabel,
  textPlaceholder,
  showTarget,
  ctaLabel,
}: {
  toolKey: string;
  needsText: boolean;
  textLabel?: string;
  textPlaceholder?: string;
  showTarget: boolean;
  ctaLabel: string;
}) {
  const [state, formAction] = useActionState(runToolAction, INITIAL);
  const [copied, setCopied] = useState(false);

  async function copyOutput() {
    if (!state.output) return;
    try {
      await navigator.clipboard.writeText(state.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // تعذّر النسخ — نتجاهل
    }
  }

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="tool" value={toolKey} />

        {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

        {showTarget && (
          <Input
            name="target"
            label="المنحة أو الجهة المستهدفة (اختياري)"
            placeholder="منحة تشيفينينغ البريطانية — ماجستير السياسات العامة"
            hint="ذكر المنحة يجعل المخرجات موجّهة ومطابقة لمعاييرها."
          />
        )}

        {needsText && (
          <Textarea
            name="input"
            label={textLabel ?? "النص"}
            rows={10}
            placeholder={textPlaceholder}
            required
          />
        )}

        <SubmitButton size="lg" pendingText="جارٍ التوليد…">
          <Sparkles className="size-4" />
          {ctaLabel}
        </SubmitButton>
      </form>

      {state.ok && state.output && (
        <div className="rounded-2xl border border-ink-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-3.5">
            <h2 className="text-[14px] font-bold text-ink-900">الناتج</h2>
            <button
              type="button"
              onClick={copyOutput}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-300 px-3 py-1.5 text-[12px] font-semibold text-ink-600 transition-colors hover:border-navy-300 hover:text-navy-700"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-[color:var(--color-success)]" />
                  تم النسخ
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  نسخ النص
                </>
              )}
            </button>
          </div>

          {state.mocked && (
            <div className="px-5 pt-4">
              <Alert tone="warning">
                هذا ناتج تجريبي (وضع المحاكاة). أضف مفتاح مزوّد الذكاء الاصطناعي لتفعيل التوليد
                الفعلي.
              </Alert>
            </div>
          )}

          <pre className="whitespace-pre-wrap px-5 py-5 font-sans text-[13px] leading-loose text-ink-700">
            {state.output}
          </pre>
        </div>
      )}
    </div>
  );
}
