import type { Metadata } from "next";

import { AuthSplit } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { LogoMark } from "@/components/ui/logo";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default function RegisterPage() {
  return (
    <AuthSplit
      scene="sky"
      panelSide="end"
      panelBadge="منحتك تبدأ بخطوة"
      panelTitle="خطوتك الأولى نحو مستقبل أكاديمي أفضل!"
      panelText="أنشئ حسابك الآن مجاناً للوصول إلى أحدث المنح الدراسية والتخصصات المخصّصة لك."
    >
      <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[0_12px_36px_-20px_rgb(15_23_42/0.25)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="size-10" />
          <h1 className="mt-3 font-display text-xl font-extrabold text-navy-800">
            أنشئ حسابك في منحتي
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-500">
            ابدأ باكتشاف الفرص الأكاديمية المناسبة لك
          </p>
        </div>

        <RegisterForm />
      </div>
    </AuthSplit>
  );
}
