import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCentered } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "إنشاء كلمة مرور جديدة" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; code?: string }>;
}) {
  const { email, code } = await searchParams;
  if (!email || !code) redirect("/forgot-password");

  return (
    <AuthCentered>
      <div className="mb-6 text-center">
        <h1 className="font-display text-xl font-extrabold text-navy-800">
          إنشاء كلمة مرور جديدة
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          اختر كلمة مرور قوية لم تستخدمها من قبل.
        </p>
      </div>

      <ResetPasswordForm email={email} code={code} />
    </AuthCentered>
  );
}
