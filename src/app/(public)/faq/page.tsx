import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { SITE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: "إجابات عن أكثر الأسئلة تكراراً حول منصة منحتي والمنح الدراسية.",
};

const FAQ = [
  {
    q: "هل استخدام منحتي مجاني؟",
    a: "نعم، كل خدمات المنصة مجانية بالكامل للطلاب — بما في ذلك أدوات الذكاء الاصطناعي ومراجعة السيرة الذاتية من خبير أكاديمي. لا توجد رسوم ولا اشتراكات.",
  },
  {
    q: "هل منحتي جهة مانحة للمنح؟",
    a: "لا. منحتي منصة معلوماتية تجمع المنح المعلنة من جهاتها الرسمية وتعرضها بشكل منظّم، وتساعدك على تجهيز طلبك. قرار القبول يعود بالكامل للجهة المانحة.",
  },
  {
    q: "كيف تُحسب نسبة التوافق مع المنحة؟",
    a: "نقارن بيانات ملفك الأكاديمي (مستوى الدراسة التالي، التخصص، المعدل التراكمي، شهادات اللغة، الاهتمامات) بشروط كل منحة. كل عامل له وزن محدّد، ويمكنك الاطلاع على أسباب التوافق بالضغط على «لماذا تناسبني؟» في بطاقة المنحة.",
  },
  {
    q: "لماذا لا تظهر لي أي منح مقترحة؟",
    a: "المطابقة تحتاج بيانات كافية. أضف مؤهلك الدراسي الحالي وتخصصك ومهاراتك على الأقل من صفحة الملف الأكاديمي، وستبدأ الاقتراحات بالظهور فوراً.",
  },
  {
    q: "كم يستغرق طلب صياغة السيرة الذاتية؟",
    a: "المدة المتوقعة بين 24 و48 ساعة عمل. ستصلك إشعارات بكل مرحلة، ويمكنك متابعة حالة الطلب والتواصل مع الخبير من صفحة متابعة الطلب.",
  },
  {
    q: "هل بياناتي تُشارك مع الجامعات؟",
    a: "لا، إلا إذا فعّلت ذلك بنفسك. خيار «مشاركة البيانات مع الجامعات» معطّل افتراضياً في صفحة الإعدادات، ويمكنك إيقافه في أي وقت.",
  },
  {
    q: "كيف أتابع مواعيد التقديم حتى لا تفوتني؟",
    a: "احفظ المنح التي تهمّك بالضغط على أيقونة الحفظ، وستظهر في صفحة المحفوظات مع عدّاد تنازلي لكل موعد. فعّل تنبيهات البريد من الإعدادات لتصلك تذكيرات قبل انتهاء المواعيد.",
  },
  {
    q: "ماذا لو وجدت خطأ في بيانات منحة؟",
    a: `راسلنا على ${SITE.email} مع رابط المنحة وسنراجع البيانات ونحدّثها. بيانات المنح تُراجع من فريق التحرير قبل النشر، لكن الشروط قد تتغيّر من الجهة المانحة.`,
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center">
          <h1 className="font-display text-3xl font-extrabold text-navy-800">الأسئلة الشائعة</h1>
          <p className="mt-3 text-[14px] text-ink-500">
            إجابات سريعة عن أكثر ما يسأل عنه الطلاب.
          </p>
        </header>

        <ul className="space-y-3">
          {FAQ.map((item) => (
            <li key={item.q}>
              <details className="group rounded-2xl border border-ink-200 bg-white px-5 py-4 transition-colors open:border-navy-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[14px] font-bold text-ink-900">
                  {item.q}
                  <ChevronDown className="size-4 shrink-0 text-ink-400 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 border-t border-ink-100 pt-3 text-[13px] leading-loose text-ink-600">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-[13px] text-ink-500">
          لم تجد إجابتك؟{" "}
          <Link href="/contact" className="font-bold text-navy-700 hover:underline">
            تواصل معنا
          </Link>
        </p>
      </div>
    </div>
  );
}
