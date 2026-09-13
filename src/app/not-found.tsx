import Link from "next/link";
import { Compass } from "lucide-react";

import { LogoMark } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-100 px-4 text-center">
      <LogoMark className="size-12" />

      <p className="num mt-8 font-display text-6xl font-extrabold text-navy-200">404</p>
      <h1 className="mt-3 font-display text-2xl font-extrabold text-navy-800">
        الصفحة غير موجودة
      </h1>
      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-ink-500">
        ربما تغيّر الرابط أو حُذفت الصفحة. جرّب العودة للرئيسية أو تصفّح المنح المتاحة.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/" size="lg">
          العودة للرئيسية
        </ButtonLink>
        <ButtonLink href="/scholarships" size="lg" variant="outline">
          <Compass className="size-4" />
          تصفّح المنح
        </ButtonLink>
      </div>

      <Link href="/contact" className="mt-8 text-[12.5px] font-semibold text-ink-400 hover:text-navy-700">
        تواصل مع الدعم
      </Link>
    </div>
  );
}
