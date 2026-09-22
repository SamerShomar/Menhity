import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BellRing,
  FileCheck2,
  GraduationCap,
  Globe2,
  Search,
  Sparkles,
  Target,
  UserRoundPlus,
  Users,
} from "lucide-react";

import { HeroScene } from "@/components/public/HeroScene";
import { ScholarshipCard, ScholarshipCardSkeleton } from "@/components/scholarships/ScholarshipCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Section";
import { metaApi, scholarshipApi } from "@/api/endpoints";
import { useAuth } from "@/context/AuthContext";
import { useMeta } from "@/context/MetaContext";
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

export default function LandingPage() {
  const site = useMeta().site;
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
      <section className="relative overflow-hidden bg-navy-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(246,196,69,0.18),transparent_55%)]" />

        <div className="container-page relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-gold-200">
              <Sparkles className="size-4" />
              مجاناً بالكامل — بدعم الذكاء الاصطناعي
            </span>

            <h1 className="mt-5 font-display text-3xl leading-[1.4] sm:text-4xl lg:text-[2.75rem]">
              منحتك الدراسية تبدأ من هنا
            </h1>

            <p className="mt-4 max-w-xl text-base leading-8 text-navy-100 sm:text-lg">
              {site.description}
            </p>

            <form onSubmit={onSearch} className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 start-4 size-5 -translate-y-1/2 text-white/60" />
                <input
                  type="search"
                  value={term}
                  onChange={(event) => setTerm(event.target.value)}
                  placeholder="ابحث عن منحة، دولة، أو تخصص…"
                  aria-label="ابحث عن منحة"
                  className="h-13 w-full rounded-xl border border-white/25 bg-white/15 backdrop-blur-lg text-white placeholder:text-white/65 focus:bg-white/22 focus:ring-2 focus:ring-gold-400/70 focus:outline-none py-3.5 ps-12 pe-4 text-sm"
                />
              </div>
              <Button type="submit" variant="gold" size="lg">
                ابحث الآن
              </Button>
            </form>

            {/* على الهاتف يمتدّ الزرّان بعرض الشاشة بدل صفٍّ متعرّج */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {!isAuthenticated ? (
                <ButtonLink to="/register" size="lg" className="bg-white text-navy-700 hover:bg-navy-500/10">
                  أنشئ حسابك مجاناً
                </ButtonLink>
              ) : (
                <ButtonLink to="/dashboard" size="lg" className="bg-white text-navy-700 hover:bg-navy-500/10">
                  اذهب للوحة التحكم
                </ButtonLink>
              )}
              <ButtonLink to="/scholarships" size="lg" variant="onDark">
                تصفّح كل المنح
                <ArrowLeft className="size-4" />
              </ButtonLink>
            </div>
          </div>

          <div className="hidden justify-center lg:flex">
            <HeroScene className="w-full max-w-lg" />
          </div>
        </div>
      </section>

      {/* ============ الأرقام ============ */}
      <section className="border-b border-ink-900/8 py-10">
        <div className="container-page grid grid-cols-2 gap-6 lg:grid-cols-4">
          {STAT_LABELS.map((stat) => (
            <div key={stat.key} className="flex items-center gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy-500/10 text-navy-700">
                <stat.icon className="size-6" />
              </span>
              <div className="min-w-0">
                <p className="num font-display text-2xl font-extrabold text-navy-800">
                  {formatNumber(stats?.[stat.key] ?? 0)}
                  <span className="text-gold-500">+</span>
                </p>
                <p className="text-[13px] text-ink-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ المنح المميزة ============ */}
      <section className="py-14">
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
            eyebrow="كيف تعمل منحتي؟"
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
        <div className="container-page">
          <SectionHeading
            eyebrow="بإشراف خبير أكاديمي"
            title="صياغة سيرتك الذاتية وخطاب دافعك"
            description="فريق منحتي يكتب ملفك من الصفر، والذكاء الاصطناعي يراجع سيرتك وخطابك الحاليين ويعيد لك نسخة محسّنة."
          />

          <div className="mt-8 flex justify-center">
            <ButtonLink to="/tools" variant="gold" size="lg">
              تعرّف على الخدمة
              <ArrowLeft className="size-4" />
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ============ الدعوة للتسجيل ============ */}
      {!isAuthenticated ? (
        <section className="bg-navy-700 py-14 text-white">
          <div className="container-page text-center">
            <h2 className="font-display text-2xl sm:text-3xl">جاهز لتبدأ رحلتك الدراسية؟</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-navy-100">
              أنشئ حسابك مجاناً، أكمل ملفك الأكاديمي، ودع منحتي ترشّح لك المنح الأنسب وتجهّز مستنداتك.
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
