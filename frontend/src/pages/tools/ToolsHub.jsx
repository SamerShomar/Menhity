import { Link } from "react-router-dom";
import { ArrowLeft, FileUser, Sparkles, UserRoundCheck } from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/Section";
import { LoadingBlock } from "@/components/ui/Spinner";
import { aiApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { TOOL_ROUTES } from "@/lib/constants";

export default function ToolsHubPage() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useApi(aiApi.tools, []);

  const tools = data?.data ?? [];
  const aiConfigured = data?.meta?.ai_configured;

  return (
    <div className="bg-ink-100 py-12">
      <div className="container-page">
        <SectionHeading
          as="h1"
          eyebrow="مجاناً بالكامل"
          title="أدوات الذكاء الاصطناعي"
          description="خمس أدوات تكتب وتحسّن وتراجع مستندات تقديمك، تعمل مباشرة على بيانات ملفك الأكاديمي."
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
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.key}
                to={TOOL_ROUTES[tool.key] ?? "/tools"}
                className="group flex flex-col rounded-2xl bg-white p-6 ring-1 ring-ink-200 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-navy-200"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-navy-50 text-navy-700 transition group-hover:bg-navy-700 group-hover:text-white">
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
        )}

        {/* خدمة الخبير */}
        <div className="mt-10 overflow-hidden rounded-3xl bg-navy-700 text-white">
          <div className="grid items-center gap-8 p-8 lg:grid-cols-[1fr_auto] lg:p-10">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold-400/20 px-4 py-1.5 text-sm font-semibold text-gold-200">
                <Sparkles className="size-4" />
                خدمة مجانية بإشراف خبير
              </span>

              <h2 className="mt-4 font-display text-2xl">صياغة سيرتك الذاتية بإشراف خبير</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-8 text-navy-100">
                أكمل بيانات ملفك عبر خمس خطوات، ثم يتولّى خبير مراجعة سيرتك وإعادة صياغتها وفق معايير
                لجان المنح الدولية ومعايير أنظمة الفرز الآلي (ATS) — وتتابع مراحل العمل لحظة بلحظة.
              </p>

              <ul className="mt-5 grid gap-2.5 text-sm text-navy-100 sm:grid-cols-2">
                {[
                  "خمس خطوات مبنية على ملفك الأكاديمي",
                  "مراجعة يدوية من خبير قبولات",
                  "تقرير توافق مع أنظمة ATS",
                  "متابعة مراحل الطلب حتى التسليم",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold-400" />
                    {point}
                  </li>
                ))}
              </ul>

              <ButtonLink to={isAuthenticated ? "/tools/cv-builder" : "/register"} variant="gold" size="lg" className="mt-7">
                <FileUser className="size-4" />
                {isAuthenticated ? "ابدأ صياغة سيرتك" : "أنشئ حساباً وابدأ"}
              </ButtonLink>
            </div>

            <div className="hidden lg:block">
              <span className="grid size-40 place-items-center rounded-3xl bg-white/10">
                <UserRoundCheck className="size-20 text-gold-300" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
