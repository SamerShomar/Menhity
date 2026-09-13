import type { Metadata } from "next";
import { ArrowLeft, Compass, HeartHandshake, Sparkles, Target } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section";
import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "من نحن",
  description: SITE.description,
};

const VALUES = [
  {
    icon: Compass,
    title: "معلومة موثوقة",
    text: "نجمع بيانات المنح من مصادرها الرسمية ونحدّثها باستمرار، ونعرض الشروط والمواعيد بوضوح دون مبالغة.",
  },
  {
    icon: Target,
    title: "مطابقة لا مجرد بحث",
    text: "لا نكتفي بعرض قائمة منح — نقارن ملفك الأكاديمي بشروط كل منحة ونشرح لك سبب ملاءمتها.",
  },
  {
    icon: Sparkles,
    title: "أدوات تُنجز العمل",
    text: "من السيرة الذاتية إلى خطاب الدافع، أدواتنا تختصر أسابيع من التجهيز إلى ساعات.",
  },
  {
    icon: HeartHandshake,
    title: "مجاناً للطلاب",
    text: "كل خدمات المنصة — بما فيها مراجعة السيرة الذاتية من خبير أكاديمي — متاحة دون أي رسوم.",
  },
];

const STEPS = [
  { n: 1, title: "أنشئ ملفك", text: "أدخل مؤهلاتك وخبراتك ومهاراتك مرة واحدة." },
  { n: 2, title: "اكتشف المنح", text: "نعرض لك المنح المناسبة مرتّبة حسب نسبة التوافق." },
  { n: 3, title: "جهّز طلبك", text: "استخدم الأدوات الذكية ومراجعة الخبير لتجهيز مستنداتك." },
  { n: 4, title: "تابع فرصك", text: "احفظ المنح وتابع مواعيدها بتذكيرات واضحة." },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-ink-200 bg-white py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="منحتي… نقرّبك من فرصتك الأكاديمية المثالية"
            title="من نحن؟"
            description={SITE.description}
          />
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {VALUES.map((value) => (
            <Card key={value.title}>
              <CardBody>
                <value.icon className="size-7 text-navy-600" strokeWidth={1.7} />
                <h2 className="mt-4 text-[15px] font-bold text-ink-900">{value.title}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{value.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-ink-50 py-16">
        <div className="container-page">
          <SectionHeading title="كيف تعمل منحتي؟" />

          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.n} className="rounded-2xl border border-ink-200 bg-white p-5">
                <span className="num flex size-9 items-center justify-center rounded-full bg-navy-700 text-[13px] font-bold text-white">
                  {step.n}
                </span>
                <h3 className="mt-4 text-[14px] font-bold text-ink-900">{step.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <ButtonLink href="/scholarships" size="lg" variant="gold">
              اكتشف المنح الآن
              <ArrowLeft className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
