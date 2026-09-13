import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { AuthCentered } from "@/components/auth/auth-shell";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "تم تغيير كلمة المرور" };

export default function ResetSuccessPage() {
  return (
    <AuthCentered>
      <div className="flex flex-col items-center text-center">
        <CheckCircle2 className="size-16 text-[color:var(--color-success)]" strokeWidth={1.8} />

        <h1 className="mt-5 font-display text-xl font-extrabold text-navy-800">
          تم تغيير كلمة المرور بنجاح
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
          <br />
          تم إنهاء جلساتك السابقة على جميع الأجهزة لحماية حسابك.
        </p>

        <ButtonLink href="/login" size="lg" fullWidth className="mt-6">
          الانتقال لتسجيل الدخول
        </ButtonLink>
      </div>
    </AuthCentered>
  );
}
