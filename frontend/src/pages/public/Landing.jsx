import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BellRing,
  Clock3,
  FileCheck2,
  GraduationCap,
  Globe2,
  Search,
  SearchCheck,
  Sparkles,
  Target,
  UserRoundPlus,
  Users,
} from "lucide-react";

import { ScholarshipCard, ScholarshipCardSkeleton } from "@/components/scholarships/ScholarshipCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Section";
import { metaApi, scholarshipApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/hooks/useApi";
import { useSaved } from "@/hooks/useSaved";
import { formatNumber } from "@/lib/utils";

const STAT_LABELS = [
  { key: "scholarships", label: "منحة دراسية", icon: GraduationCap },
  { key: "countries", label: "دولة حول العالم", icon: Globe2 },
  { key: "majors", label: "تخصصاً أكاديمياً", icon: Target },
  { key: "students", label: "طالب مسجّل", icon: Users },
];

const STEPS = [
  {
    icon: UserRoundPlus,
    title: "أنشئ ملفك الأكاديمي",
    description: "أدخل مؤهلاتك وتخصصك ولغاتك ومهاراتك مرة واحدة فقط — ملف واحد يخدم كل طلباتك.",
  },
  {
    icon: Target,
    title: "استقبل المنح المطابقة",
    description: "نقارن ملفك بشروط كل منحة ونرتّب لك النتائج حسب نسبة المطابقة.",
  },
  {
    icon: FileCheck2,
    title: "جهّز مستنداتك",
    description: "أدوات ذكية تكتب سيرتك الذاتية وخطاب التحفيز وتراجع ملفك قبل التقديم.",
  },
  {
    icon: BellRing,
    title: "تابع مواعيدك",
    description: "تنبيهات قبل إغلاق باب التقديم حتى لا تفوّت أي فرصة.",
  },
];

const FEATURES = [
  {
    icon: BadgeCheck,
    title: "منح تناسبك بدقة",
    description: "نرتّب الفرص حسب مستواك وتخصصك واللغات التي تتقنها.",
  },
  {
    icon: SearchCheck,
    title: "بحث شامل ومرن",
    description: "اكتشف المنح حسب الدولة والتخصص والمرحلة والتمويل.",
  },
  {
    icon: Clock3,
    title: "لا تفوّت المواعيد",
    description: "تابع مواعيد التقديم واحصل على تنبيهات قبل إغلاقها.",
  },
  {
    icon: Sparkles,
    title: "أدوات ذكية مساعدة",
    description: "جهّز سيرتك وخطابك وراجع مستنداتك بسهولة.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isSaved, toggle } = useSaved();
  const [term, setTerm] = useState("");

  const { data: stats } = useApi(metaApi.stats, []);
  const { data: featured, loading: featuredLoading } = useApi(scholarshipApi.featured, []);

  const onSearch = (event) => {
    event.preventDefault();
    navigate(term.trim() ? `/scholarships?q=${encodeURIComponent(term.trim())}` : "/scholarships");
  };

  return (
    <div>
      {/* ============ البطل ============ */}
      <section className="relative isolate overflow-hidden bg-[#f4f8fc] text-navy-900">
        <img
          src="/images/graduates-hero.jpg"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 size-full object-cover object-[38%_center] lg:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-[#f4f8fc] via-[#f4f8fc]/95 to-[#f4f8fc]/5" />

        <div className="container-page relative grid min-h-[520px] items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-navy-700/10 bg-white/75 px-4 py-1.5 text-sm font-semibold text-navy-700 shadow-sm backdrop-blur">
              <Sparkles className="size-4 text-navy-500" />
              فرصتك الأكاديمية تبدأ بخطوة
            </span>

            <h1 className="mt-5 max-w-xl font-display text-3xl leading-[1.4] text-navy-900 sm:text-4xl lg:text-[2.75rem]">
              كانت المنحة حلماً… <span className="text-navy-600">وبَوْصلة تجعلها أقرب</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-8 text-ink-600 sm:text-lg">
              اكتشف فرصاً دراسية حول العالم، واعثر على المنح التي تناسب طموحك، واستعد للتقديم بثقة.
            </p>

            <form onSubmit={onSearch} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 start-4 size-5 -translate-y-1/2 text-ink-400" />
                <input
                  type="search"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="ابحث عن منحة، دولة، أو تخصص…"
                  aria-label="ابحث عن منحة"
                  className="glass-soft h-13 w-full rounded-xl border border-white/80 bg-white/70 py-3.5 ps-12 pe-4 text-sm text-ink-900 placeholder:text-ink-400 focus:bg-white/90 focus:ring-2 focus:ring-navy-400/40 focus:outline-none"
                />
              </div>
              <Button type="submit" size="lg">
                ابحث الآن
              </Button>
            </form>

            {/* على الهاتف يمتدّ الزرّان بعرض الشاشة بدل صفٍّ متعرّج */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {!isAuthenticated ? (
                <ButtonLink to="/register" size="lg">
                  أنشئ حسابك مجاناً
                </ButtonLink>
              ) : (
                <ButtonLink to="/dashboard" size="lg">
                  اذهب للوحة التحكم
                </ButtonLink>
              )}
              <ButtonLink to="/scholarships" size="lg" variant="outline">
                تصفّح كل المنح
                <ArrowLeft className="size-4" />
              </ButtonLink>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </section>

      {/* ============ الأرقام ============ */}
      <section className="relative z-10 -mt-7 pb-8 text-white sm:-mt-10">
        <div className="container-page">
          <div className="grid grid-cols-2 gap-5 rounded-2xl bg-navy-800 px-5 py-6 shadow-[0_18px_45px_-20px_rgba(11,26,61,0.65)] sm:px-8 lg:grid-cols-4 lg:gap-6">
            {STAT_LABELS.map((stat) => (
              <div key={stat.key} className="flex items-center gap-3.5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-gold-300 sm:size-12">
                  <stat.icon className="size-5 sm:size-6" />
                </span>
                <div className="min-w-0">
                  <p className="num font-display text-xl font-extrabold text-white sm:text-2xl">
                    {formatNumber(stats?.[stat.key] ?? 0)}
                    <span className="text-gold-400">+</span>
                  </p>
                  <p className="text-xs text-navy-100 sm:text-[13px]">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ مزايا المنصة ============ */}
      <section className="py-12 sm:py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="كل ما تحتاجه لرحلتك"
            title="فرصتك القادمة أقرب مما تتخيّل"
            description="من البحث عن المنحة المناسبة إلى تجهيز طلبك ومتابعة مواعيده — كل شيء في مكان واحد."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-navy-100/80 bg-white/80 p-5 shadow-[0_8px_28px_-22px_rgba(16,37,85,0.4)] transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-navy-50 text-navy-700">
                  <feature.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-navy-800">{feature.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-ink-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ المنح المميزة ============ */}
      <section className="bg-white/45 py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="فرص مختارة"
            title="منح مميزة تستحق اهتمامك"
            description="منح مفتوحة حالياً اخترناها لك من جامعات وجهات مانحة حول العالم."
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredLoading
              ? Array.from({ length: 6 }).map((_, index) => <ScholarshipCardSkeleton key={index} />)
              : (featured ?? []).slice(0, 6).map((item) => (
                  <ScholarshipCard
                    key={item.id}
                    scholarship={item}
                    saved={isSaved(item.slug)}
                    onToggleSave={toggle}
                  />
                ))}
          </div>

          <div className="mt-9 text-center">
            <ButtonLink to="/scholarships" variant="outline" size="lg">
              عرض كل المنح
              <ArrowLeft className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ============ كيف تعمل المنصة ============ */}
      <section className="py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="كيف تعمل بَوْصلة؟"
            title="أربع خطوات من الملف إلى القبول"
            description="رحلة واضحة تبدأ ببيانات ملفك وتنتهي بطلب جاهز للإرسال."
          />

          <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative glass-soft rounded-2xl p-6">
                <span className="num absolute -top-3 start-6 grid size-8 place-items-center rounded-full bg-navy-700 text-sm font-bold text-white">
                  {index + 1}
                </span>
                <span className="mt-3 inline-grid size-12 place-items-center rounded-xl bg-gold-400/25 text-gold-700">
                  <step.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-navy-800">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-7 text-ink-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============ الخدمة اليدوية ============ */}
      <section className="py-14">
        <div className="container-page grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <img
            src="/images/student-success.jpg"
            alt=""
            loading="lazy"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-[0_24px_55px_-30px_rgba(16,37,85,0.55)]"
          />
          <div className="max-w-xl">
            <p className="mb-2 text-[13px] font-bold tracking-wide text-gold-600">بإشراف خبير أكاديمي</p>
            <h2 className="font-display text-2xl font-extrabold leading-snug text-ink-900 sm:text-[28px]">
              مستعد لتبدأ رحلتك الأكاديمية؟
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-600 sm:text-[15px]">
              أنشئ ملفك، واكتشف المنح المناسبة، واستفد من أدوات تساعدك على تجهيز سيرتك وخطاب الدافع قبل التقديم.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to="/scholarships" size="lg">
                اكتشف فرصتك الآن
                <ArrowLeft className="size-4" />
              </ButtonLink>
              <ButtonLink to="/tools" variant="outline" size="lg">
                استكشف الأدوات الذكية
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* ============ الدعوة للتسجيل ============ */}
      {!isAuthenticated ? (
        <section className="bg-navy-700 py-14 text-white">
          <div className="container-page text-center">
            <h2 className="font-display text-2xl sm:text-3xl">خطوتك التالية تبدأ من هنا</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-navy-100">
              أنشئ حسابك مجاناً، أكمل ملفك الأكاديمي، ودع بَوْصلة ترشّح لك المنح الأنسب وتجهّز مستنداتك.
            </p>
            <ButtonLink to="/register" variant="gold" size="lg" className="mt-7">
              ابدأ مجاناً الآن
            </ButtonLink>
          </div>
        </section>
      ) : null}
    </div>
  );
}
