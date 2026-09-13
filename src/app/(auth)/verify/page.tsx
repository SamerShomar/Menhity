import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCentered } from "@/components/auth/auth-shell";
import { VerifyForm } from "@/components/auth/verify-form";

export const metadata: Metadata = { title: "التحقق من البريد الإلكتروني" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/forgot-password");

  return (
    <AuthCentered>
      <div className="mb-6 text-center">
        <h1 className="font-display text-xl font-extrabold text-navy-800">
          تحقق من بريدك الإلكتروني
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-ink-500">
          أرسلنا رمزاً مكوّناً من 6 أرقام إلى
          <br />
          <span className="font-bold text-navy-700" dir="ltr">
            {email}
          </span>
        </p>
      </div>

      <VerifyForm email={email} />
    </AuthCentered>
  );
}
