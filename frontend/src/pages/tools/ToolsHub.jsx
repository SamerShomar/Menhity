import { Link } from "react-router-dom";
import { ArrowLeft, FileText, FileUser, UserRoundCheck } from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/Section";
import { LoadingBlock } from "@/components/ui/Spinner";
import { aiApi, cvOrderApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { cn, formatMoney } from "@/lib/utils";
import { TOOL_ROUTES } from "@/lib/constants";

/** المسار اليدوي — ثلاث خدمات يعمل عليها الفريق ويسلّم ملفاً نهائياً */
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
];

export default function ToolsHubPage() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useApi(aiApi.tools, []);

  const tools = data?.data ?? [];
  const aiConfigured = data?.meta?.ai_configured;

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
          eyebrow="أدوات الذكاء الاصطناعي مجانية"
          title="أدوات ومساعدة منحتي"
          description="مساران: أدوات فورية يشغّلها الذكاء الاصطناعي، وخدمة يدوية يعمل عليها فريق منحتي بنفسه."
        />

        {error ? <Alert tone="danger" className="mt-8">{error}</Alert> : null}

        {aiConfigured === false ? (
          <Alert tone="warning" className="mx-auto mt-8 max-w-3xl" title="وضع المحاكاة">
            مفتاح الذكاء الاصطناعي غير مضبوط على الخادم، لذا تُعيد الأدوات نصوصاً توضيحية جاهزة بدل
            التوليد الفعلي. أضف بيانات مزوّد في ملف البيئة لتفعيل التوليد — مثل{" "}
            <span className="num">CLOUDFLARE_ACCOUNT_ID</span> و<span className="num">CLOUDFLARE_API_TOKEN</span>{" "}
            (مجاني).
          </Alert>
        ) : null}

        {loading ? (
          <LoadingBlock className="py-16" />
        ) : (
          <>
            <div className="mt-12 flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="font-display text-xl font-bold text-navy-800">فوري — بالذكاء الاصطناعي</h2>
              <p className="text-[13px] text-ink-500">نتيجة خلال ثوانٍ، تعمل على بيانات ملفك الأكاديمي.</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool) => (
              <Link
                key={tool.key}
                to={TOOL_ROUTES[tool.key] ?? "/tools"}
                className="group flex flex-col glass rounded-2xl p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-navy-200"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-navy-500/10 text-navy-700 transition group-hover:bg-navy-700 group-hover:text-white">
                  <Icon name={tool.icon} className="size-6" />
                </span>

                <h2 className="mt-4 font-display text-lg font-bold text-navy-800">{tool.name_ar}</h2>
                <p className="mt-2 flex-1 text-[13px] leading-7 text-ink-600">{tool.description}</p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-navy-600">
                  ابدأ الآن
                  <ArrowLeft className="size-3.5 transition group-hover:-translate-x-1" />
                </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ---------- الخدمة اليدوية ---------- */}
        <div className="mt-14 flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-navy-800">يدوي — فريق منحتي</h2>
          <p className="text-[13px] text-ink-500">يعمل الفريق على ملفك بنفسه ويسلّمك نسخة جاهزة خلال 24–48 ساعة.</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
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

        <Alert tone="info" className="mt-6">
          <span className="font-bold">الفرق بين المسارين: </span>
          الأدوات الفورية يكتبها الذكاء الاصطناعي في ثوانٍ وتصلح كنقطة بداية، وهي مجانية. أما الخدمة
          اليدوية فيراجعها فريق منحتي بنفسه ويسلّمك ملفاً نهائياً، ويظهر سعرها على كل بطاقة.
        </Alert>
      </div>
    </div>
  );
}
