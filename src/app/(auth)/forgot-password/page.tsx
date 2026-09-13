import type { Metadata } from "next";

import { AuthCentered } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "استعادة كلمة المرور" };

export default function ForgotPasswordPage() {
  return (
    <AuthCentered>
      <div className="mb-6 text-center">
        <h1 className="font-display text-xl font-extrabold text-navy-800">استعادة كلمة المرور</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          أدخل بريدك الإلكتروني المسجّل وسنرسل لك رمزاً لإعادة تعيين كلمة المرور.
        </p>
      </div>

      <ForgotPasswordForm />
    </AuthCentered>
  );
}
