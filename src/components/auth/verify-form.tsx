"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { resendCodeAction, verifyCodeAction } from "@/app/(auth)/actions";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { Alert } from "@/components/ui/alert";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";

const LENGTH = 6;
const RESEND_SECONDS = 60;

export function VerifyForm({ email }: { email: string }) {
  const [state, formAction] = useActionState(verifyCodeAction, EMPTY_FORM_STATE);
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const code = digits.join("");

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputs.current[Math.min(pasted.length, LENGTH - 1)]?.focus();
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-5" noValidate>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="code" value={code} />

        {state.message && !state.ok && <Alert tone="danger">{state.message}</Alert>}

        {/* حقول الرمز — تُعرض من اليسار لليمين كالأرقام */}
        <div className="flex justify-center gap-2" dir="ltr" onPaste={onPaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              aria-label={`الرقم ${i + 1} من ${LENGTH}`}
              className={cn(
                "size-12 rounded-xl border text-center text-lg font-bold text-ink-900 transition-colors",
                "focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/15",
                digit ? "border-navy-400 bg-navy-50" : "border-ink-300 bg-white",
              )}
            />
          ))}
        </div>

        <SubmitButton fullWidth size="lg" disabled={code.length < LENGTH} pendingText="جارٍ التحقق…">
          التحقق من الرمز
        </SubmitButton>
      </form>

      <ResendBlock email={email} />
    </div>
  );
}

function ResendBlock({ email }: { email: string }) {
  const [state, formAction] = useActionState(resendCodeAction, EMPTY_FORM_STATE);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  useEffect(() => {
    if (state.ok) setSeconds(RESEND_SECONDS);
  }, [state]);

  return (
    <form action={formAction} className="text-center">
      <input type="hidden" name="email" value={email} />
      {state.ok && state.message && (
        <Alert tone="success" className="mb-3">
          {state.message}
        </Alert>
      )}
      {seconds > 0 ? (
        <p className="text-[12.5px] text-ink-500">
          يمكنك إعادة إرسال الرمز بعد <span className="num font-bold text-navy-700">{seconds}</span>{" "}
          ثانية
        </p>
      ) : (
        <ResendButton />
      )}
    </form>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-[13px] font-bold text-navy-700 hover:underline disabled:opacity-60"
    >
      {pending ? "جارٍ الإرسال…" : "إعادة إرسال الرمز"}
    </button>
  );
}
