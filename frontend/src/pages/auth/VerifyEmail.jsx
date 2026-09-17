import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { AuthCentered } from "@/components/auth/AuthShell";
import { CODE_LENGTH, CodeInput, emptyCode } from "@/components/auth/CodeInput";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { authApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useSubmit } from "@/hooks/useApi";

const RESEND_SECONDS = 60;

/* حين يبلّغ الخادم أن الرسالة لم تغادره أصلاً، لا معنى لانتظار دقيقة كاملة */
const RETRY_SECONDS = 15;

/**
 * تأكيد البريد بعد إنشاء الحساب.
 *
 * ينجح التأكيد فيسلّم الخادم توكن الجلسة مباشرة، فيدخل المستخدم
 * إلى لوحته دون الحاجة لتسجيل دخول منفصل.
 */
export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adoptSession } = useAuth();

  const email = location.state?.email;
  const notice = location.state?.notice;
  // false فقط حين أبلغ الخادم صراحةً أن رسالة الرمز لم تُرسَل (تعطّل مزوّد البريد)
  const codeSent = location.state?.codeSent !== false;

  const [digits, setDigits] = useState(emptyCode);
  const [seconds, setSeconds] = useState(codeSent ? RESEND_SECONDS : RETRY_SECONDS);
  const [resent, setResent] = useState(null);
  const codeInput = useRef(null);

  const { submit, submitting, error, fieldErrors } = useSubmit(authApi.verifyEmail);
  const resend = useSubmit(authApi.resendVerification);

  // بلا بريد لا معنى للشاشة — نعيد المستخدم لبداية المسار
  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const code = digits.join("");

  const onSubmit = async (event) => {
    event.preventDefault();
    const { ok, result } = await submit({ email, code });

    if (!ok) return;

    // الحساب كان مؤكَّداً سابقاً — لا توكن، فنوجّهه لتسجيل الدخول
    if (result?.already_verified) {
      navigate("/login", { replace: true, state: { notice: result.message } });
      return;
    }

    adoptSession(result.token, result.user);
    navigate(result.user?.is_admin_level ? "/admin" : "/dashboard", { replace: true });
  };

  const onResend = async () => {
    const { ok } = await resend.submit({ email });

    if (ok) {
      setResent("أرسلنا رمزاً جديداً إلى بريدك الإلكتروني.");
      setSeconds(RESEND_SECONDS);
      setDigits(emptyCode());
      codeInput.current?.focusFirst();
    }
  };

  return (
    <AuthCentered
      icon={<ShieldCheck className="size-6" />}
      title="أكّد بريدك الإلكتروني"
      description={
        <>
          {codeSent ? "أرسلنا رمزاً من ستة أرقام إلى" : "سنرسل رمزاً من ستة أرقام إلى"}
          <br />
          <span className="font-semibold text-navy-700" dir="ltr">
            {email}
          </span>
        </>
      }
    >
      {notice && !resent ? (
        <Alert tone={codeSent ? "success" : "warning"} className="mb-5">
          {notice}
          {!codeSent ? (
            <span className="mt-1 block">
              المشكلة في إرسال البريد من جهتنا لا في بريدك. إن تكرّرت بعد إعادة الإرسال، تواصل مع الدعم.
            </span>
          ) : null}
        </Alert>
      ) : null}

      {resent ? (
        <Alert tone="success" className="mb-5">
          {resent}
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger" className="mb-5">
          {fieldErrors.code?.[0] ?? error}
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <CodeInput ref={codeInput} digits={digits} onChange={setDigits} disabled={submitting} />

        <Button type="submit" className="w-full" loading={submitting} disabled={code.length < CODE_LENGTH}>
          تأكيد الحساب
        </Button>
      </form>

      <div className="mt-5 text-center text-sm text-ink-500">
        لم يصلك الرمز؟{" "}
        {seconds > 0 ? (
          <span>
            أعد الإرسال بعد <span className="num font-semibold text-navy-700">{seconds}</span> ثانية
          </span>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={resend.submitting}
            className="font-semibold text-navy-600 hover:underline disabled:opacity-60"
          >
            {resend.submitting ? "جارٍ الإرسال…" : "إعادة الإرسال"}
          </button>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-ink-400">
        تحقّق من مجلد الرسائل غير المرغوب فيها (Spam) إن لم تجد الرسالة في صندوق الوارد.
      </p>

      <Link
        to="/register"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-semibold text-navy-600 hover:underline"
      >
        <ArrowRight className="size-4" />
        تغيير البريد الإلكتروني
      </Link>
    </AuthCentered>
  );
}
