import { FileText, FileUser, PenLine, UserRoundCheck } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Section";
import { cvOrderApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { cn, formatMoney } from "@/lib/utils";

/** خدمة يدوية واحدة يعمل عليها الفريق ويسلّم ملفاً نهائياً */
const MANUAL_SERVICES = [
  {
    key: "cv_build",
    title: "كتابة سيرة ذاتية من الصفر",
    description:
      "أكمل بيانات ملفك عبر خمس خطوات، ويتولّى الفريق صياغتها وتنسيقها وفق معايير لجان المنح وأنظمة الفرز الآلي.",
    to: "/tools/cv-builder",
    cta: "ابدأ الخطوات",
    icon: FileUser,
    primary: true,
  },
  {
    key: "cv_improve",
    title: "تحسين سيرة ذاتية",
    description:
      "أرفق سيرتك الحالية، ويعيد الفريق صياغتها وتنسيقها ويسلّمك النسخة المحسّنة جاهزة للتقديم.",
    to: "/tools/request?kind=cv_improve",
    cta: "ارفع سيرتك",
    icon: FileText,
  },
  {
    key: "letter_improve",
    title: "تحسين خطاب دافع",
    description: "أرفق خطابك، ويراجعه الفريق ليقوّي حججه وربطه بالمنحة وأسلوبه اللغوي.",
    to: "/tools/request?kind=letter_improve",
    cta: "ارفع خطابك",
    icon: UserRoundCheck,
  },
  {
    key: "letter_build",
    title: "كتابة خطاب دافع من الصفر",
    description:
      "لا خطاب لديك بعد؟ صف دوافعك وهدفك والمنحة التي تتقدّم لها، ويكتبه الفريق من الصفر.",
    to: "/tools/request?kind=letter_build",
    cta: "ابدأ الطلب",
    icon: PenLine,
  },
];

export default function ToolsHubPage() {
  const { isAuthenticated } = useAuth();

  // الأسعار تُقرأ من إعدادات الإدارة: ما يظهر هنا هو ما سيُطلب فعلاً
  const { data: payment } = useApi(
    () => (isAuthenticated ? cvOrderApi.paymentInfo() : Promise.resolve(null)),
    [isAuthenticated],
  );

  const priceOf = (kind) => payment?.services?.find((item) => item.kind === kind)?.price ?? null;

  return (
    <div className="py-12">
      <div className="container-page">
        <SectionHeading
          as="h1"
          eyebrow="خدمة يدوية بإشراف خبير"
          title="صياغة السيرة الذاتية وخطاب الدافع"
          description="يعمل فريق منحتي على ملفك بنفسه — من الصفر أو تحسيناً لما لديك — ويسلّمك نسخة جاهزة للتقديم."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MANUAL_SERVICES.map((service) => (
            <div key={service.key} className="glass flex flex-col rounded-2xl p-6">
              <span className="grid size-12 place-items-center rounded-xl bg-gold-400/25 text-gold-800">
                <service.icon className="size-6" />
              </span>

              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold text-navy-800">{service.title}</h3>
                {priceOf(service.key) !== null ? (
                  <span
                    className={cn(
                      "num shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold",
                      priceOf(service.key) > 0
                        ? "bg-gold-400/30 text-gold-800"
                        : "bg-navy-500/12 text-navy-700",
                    )}
                  >
                    {priceOf(service.key) > 0
                      ? formatMoney(priceOf(service.key), payment.currency)
                      : "مجاناً"}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 flex-1 text-[13px] leading-7 text-ink-600">{service.description}</p>

              <ButtonLink
                to={isAuthenticated ? service.to : "/register"}
                variant={service.primary ? "gold" : "outline"}
                className="mt-5"
              >
                {isAuthenticated ? service.cta : "أنشئ حساباً وابدأ"}
              </ButtonLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
