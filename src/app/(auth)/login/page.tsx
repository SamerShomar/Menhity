import type { Metadata } from "next";

import { AuthSplit } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { LogoMark } from "@/components/ui/logo";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthSplit
      scene="graduation"
      panelSide="start"
      panelBadge="منحتك تبدأ بخطوة"
      panelTitle="مرحباً بعودتك إلى منحتي"
      panelText="مكان واحد يساعدك على ترتيب فرص المنح وخطوات التقديم بثقة."
    >
      <div className="rounded-2xl border border-ink-200 bg-white p-7 shadow-[0_12px_36px_-20px_rgb(15_23_42/0.25)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="size-10" />
          <h1 className="mt-3 font-display text-xl font-extrabold text-navy-800">مرحباً بعودتك</h1>
          <p className="mt-1.5 text-[13px] text-ink-500">سجّل الدخول للمتابعة إلى حسابك</p>
        </div>

        <LoginForm next={next} />
      </div>
    </AuthSplit>
  );
}
