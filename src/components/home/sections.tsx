import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  FileUser,
  GraduationCap,
  PenLine,
  Search,
  Sparkles,
  Star,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section";
import { formatNumber } from "@/lib/utils";

/* ============================================================
   شريط الإحصائيات
   ============================================================ */

export function StatsBand({
  stats,
}: {
  stats: { scholarships: number; countries: number; majors: number; students: number };
}) {
  const items = [
    { value: stats.scholarships, label: "منحة متاحة" },
    { value: stats.countries, label: "دولة" },
    { value: stats.majors, label: "تخصص" },
    { value: stats.students, label: "طالب وطالبة" },
  ];

  return (
    <div className="container-page -mt-12 relative z-10">
      <div className="grid grid-cols-2 divide-ink-200 rounded-2xl border border-ink-200 bg-white py-6 shadow-[0_16px_40px_-24px_rgb(15_23_42/0.25)] sm:divide-x sm:divide-x-reverse lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="px-6 py-3 text-center">
            <p className="num font-display text-2xl font-extrabold text-navy-800 sm:text-3xl">
              +{formatNumber(item.value)}
            </p>
            <p className="mt-1 text-[13px] font-medium text-ink-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   المميزات الأربع
   ============================================================ */

const FEATURES = [
  {
    icon: GraduationCap,
    title: "منح تناسبك",
    text: "اكتشف فرصاً تتوافق مع تخصصك ومستواك الأكاديمي واهتماماتك.",
    tone: "navy",
  },
  {
    icon: Search,
    title: "بحث سهل ومرن",
    text: "ابحث عن المنحة حسب الدولة والتخصص ونوع التمويل ومعايير مختلفة.",
    tone: "gold",
  },
  {
    icon: Sparkles,
    title: "أدوات ذكية",
    text: "استخدم أدوات الذكاء الاصطناعي لتجهيز سيرتك الذاتية وخطاب الدافع.",
    tone: "navy",
  },
  {
    icon: Clock,
    title: "لا تفوّت المواعيد",
    text: "تابع مواعيد التقديم بتذكيرات واضحة واحفظ الفرص المهمة.",
    tone: "gold",
  },
] as const;

export function Features() {
  return (
    <section className="container-page py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <SectionHeading
          align="start"
          title="كل ما تحتاجه لتصل إلى فرصتك القادمة"
          description="اكتشف المنح المناسبة لك، تابع مواعيد التقديم، واستفد من أدواتنا الذكية لتجهيز طلبك بثقة."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => {
            const isGold = feature.tone === "gold";
            return (
              <div
                key={feature.title}
                className={
                  isGold
                    ? "rounded-2xl border-2 border-gold-300 bg-white p-5 transition-shadow hover:shadow-[0_12px_32px_-16px_rgb(230_172_28/0.4)]"
                    : "rounded-2xl bg-navy-700 p-5 text-white transition-shadow hover:shadow-[0_12px_32px_-16px_rgb(20_48_107/0.6)]"
                }
              >
                <feature.icon
                  className={isGold ? "size-7 text-gold-500" : "size-7 text-gold-400"}
                  strokeWidth={1.7}
                />
                <h3 className={`mt-4 text-[15px] font-bold ${isGold ? "text-navy-800" : "text-white"}`}>
                  {feature.title}
                </h3>
                <p
                  className={`mt-2 text-[12.5px] leading-relaxed ${isGold ? "text-ink-500" : "text-navy-100"}`}
                >
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   أدوات الذكاء الاصطناعي
   ============================================================ */

const HOME_TOOLS = [
  {
    icon: FileUser,
    title: "أنشئ سيرة ذاتية احترافية",
    text: "سيرة ذاتية تناسب تخصصك وأهدافك، بمساعدة الذكاء الاصطناعي ومراجعة خبير أكاديمي.",
    href: "/tools/cv-builder",
  },
  {
    icon: PenLine,
    title: "جهّز خطاب الدافع",
    text: "أنشئ وطوّر خطاب دافع مخصّص للمنحة، يعكس خبراتك وأهدافك بطريقة احترافية.",
    href: "/tools/letter-builder",
  },
  {
    icon: Star,
    title: "قيّم ملفك الأكاديمي",
    text: "احصل على تقييم لجاهزية ملفك، مع خطوات عملية لرفع فرصك في القبول.",
    href: "/tools/profile-review",
  },
] as const;

export function AiToolsSection() {
  return (
    <section className="bg-ink-50 py-20">
      <div className="container-page">
        <SectionHeading
          title="أدوات ذكية تجعل التقديم أسهل"
          description="استفد من الذكاء الاصطناعي لتجد المنح الأنسب لك، وتجهّز طلبك، وتزيد فرصك في التقديم بنجاح."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {HOME_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl bg-navy-700 p-6 text-center text-white transition-all hover:-translate-y-1 hover:bg-navy-800"
            >
              <tool.icon className="mx-auto size-10 text-gold-400" strokeWidth={1.5} />
              <h3 className="mt-5 text-[15px] font-bold">{tool.title}</h3>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-navy-100">{tool.text}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold text-gold-300 opacity-0 transition-opacity group-hover:opacity-100">
                ابدأ الآن
                <ArrowLeft className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   من نحن
   ============================================================ */

export function AboutSection() {
  return (
    <section className="container-page py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        {/* رسمة الكرة الأرضية */}
        <div className="order-2 lg:order-1">
          <div className="relative mx-auto aspect-4/3 w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-gold-600 to-gold-800">
            <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
              <circle cx="200" cy="150" r="105" fill="#14306b" />
              <circle cx="200" cy="150" r="105" fill="none" stroke="#f6c445" strokeWidth="2" opacity="0.5" />
              <ellipse cx="200" cy="150" rx="105" ry="38" fill="none" stroke="#7f9fdd" strokeWidth="1.6" opacity="0.6" />
              <ellipse cx="200" cy="150" rx="105" ry="72" fill="none" stroke="#7f9fdd" strokeWidth="1.6" opacity="0.45" />
              <ellipse cx="200" cy="150" rx="42" ry="105" fill="none" stroke="#7f9fdd" strokeWidth="1.6" opacity="0.45" />
              <path
                d="M132 118c18-8 34 4 52-2s28-16 46-10 30 22 18 38-38 10-54 22-34 22-48 10-32-50-14-58Z"
                fill="#2b52ab"
                opacity="0.85"
              />
              <g fill="#f6c445">
                <circle cx="168" cy="128" r="4" />
                <circle cx="228" cy="160" r="4" />
                <circle cx="196" cy="196" r="4" />
              </g>
            </svg>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-[13px] font-bold text-gold-600">منحتي… نقرّبك من فرصتك الأكاديمية المثالية</p>
          <h2 className="mt-2 font-display text-2xl font-extrabold text-ink-900 sm:text-[28px]">
            من نحن؟
          </h2>
          <p className="mt-5 text-[14.5px] leading-loose text-ink-600">
            «منحتي» منصة تساعد الطلاب على اكتشاف المنح والفرص الأكاديمية المناسبة لهم. نسهّل عليك
            البحث عن الفرص، ومعرفة شروطها، ومتابعة مواعيدها، وتجهيز طلب التقديم.
          </p>
          <p className="mt-4 text-[14.5px] font-bold leading-loose text-navy-800">
            نؤمن أن الوصول إلى الفرصة المناسبة يبدأ بالمعلومة الصحيحة.
          </p>
          <Link
            href="/scholarships"
            className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-navy-700 underline-offset-4 hover:underline"
          >
            اكتشف المنح
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   كيف تعمل منحتي؟
   ============================================================ */

const STEPS = [
  { n: 1, label: "أنشئ ملفك" },
  { n: 2, label: "اكتشف المنح" },
  { n: 3, label: "جهّز طلبك" },
  { n: 4, label: "تابع فرصك" },
] as const;

export function HowItWorks() {
  return (
    <section className="bg-ink-50 py-20">
      <div className="container-page">
        <SectionHeading
          title="كيف تعمل منحتي؟"
          description="نساعدك على الانتقال من البحث عن الفرصة إلى الاستعداد للتقديم بخطوات واضحة وبسيطة."
        />

        <ol className="mx-auto mt-14 flex max-w-3xl items-start justify-between">
          {STEPS.map((step, i) => (
            <li key={step.n} className="relative flex flex-1 flex-col items-center text-center">
              {/* الخط الواصل */}
              {i < STEPS.length - 1 && (
                <span className="absolute end-1/2 top-2.5 h-0.5 w-full bg-ink-300" aria-hidden="true" />
              )}
              <span
                className={`relative z-10 flex size-5 items-center justify-center rounded-full ring-4 ring-ink-50 ${
                  step.n === 1 ? "bg-navy-700" : "bg-navy-300"
                }`}
              />
              <span className="num mt-3 text-[13px] font-extrabold text-ink-800">{step.n}</span>
              <span className="mt-1 text-[12.5px] font-semibold text-ink-600">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ============================================================
   نداء ختامي
   ============================================================ */

export function FinalCta() {
  return (
    <section className="bg-gold-400">
      <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
        {/* موكاب لابتوب */}
        <div className="order-2 lg:order-1">
          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-t-xl border-[10px] border-ink-800 bg-ink-800 shadow-2xl">
              <div className="overflow-hidden rounded-sm bg-navy-800">
                <div className="flex h-6 items-center gap-1 bg-white px-2">
                  <span className="size-1.5 rounded-full bg-ink-300" />
                  <span className="size-1.5 rounded-full bg-ink-300" />
                  <span className="size-1.5 rounded-full bg-ink-300" />
                </div>
                <div className="relative h-40 bg-gradient-to-b from-navy-600 to-navy-900 p-4 sm:h-48">
                  <p className="text-center font-display text-sm font-extrabold text-white sm:text-base">
                    اكتشف المنحة التي <span className="text-gold-400">تناسب طموحك</span>
                  </p>
                  <div className="absolute inset-x-4 bottom-3 grid grid-cols-4 gap-1.5">
                    {["+100", "+15", "+30", "+500"].map((v) => (
                      <div key={v} className="rounded bg-white/95 py-1.5 text-center">
                        <span className="num text-[10px] font-extrabold text-navy-800">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mx-auto h-2.5 w-[112%] -translate-x-[5%] rounded-b-xl bg-ink-300" />
          </div>
        </div>

        <div className="order-1 text-center lg:order-2 lg:text-start">
          <h2 className="font-display text-2xl font-extrabold text-navy-900 sm:text-3xl">
            مستعد تبدأ رحلتك؟
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-navy-800/80">
            آلاف الفرص بانتظارك. دع منحتي تساعدك في العثور على المنحة المناسبة والاستعداد للتقديم
            بثقة.
          </p>
          <ButtonLink href="/scholarships" size="lg" className="mt-7">
            اكتشف فرصتك الآن
            <ArrowLeft className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
