import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  Bookmark,
  FileText,
  GraduationCap,
  LifeBuoy,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "مركز المساعدة",
  description: "أدلّة مختصرة تشرح كيفية استخدام منصة منحتي خطوة بخطوة.",
};

const GUIDES = [
  {
    icon: UserRound,
    title: "بناء الملف الأكاديمي",
    text: "ابدأ من صفحة الملف الأكاديمي: أضف معلوماتك الشخصية والنبذة، ثم المؤهلات والخبرات والمهارات واللغات. كلما اكتمل الملف زادت دقة المطابقة.",
    href: "/dashboard/profile",
    cta: "افتح ملفي",
  },
  {
    icon: Search,
    title: "البحث عن المنح وتصفيتها",
    text: "استخدم شريط البحث للبحث بالاسم أو الدولة أو التخصص، ثم ضيّق النتائج بالفلاتر الجانبية: الدولة، المستوى، التخصص، نوع التمويل، ومتطلبات اللغة.",
    href: "/scholarships",
    cta: "تصفّح المنح",
  },
  {
    icon: GraduationCap,
    title: "فهم نسبة التوافق",
    text: "كل منحة تظهر بنسبة توافق مع ملفك. اضغط «لماذا تناسبني؟» لترى الأسباب: مستوى الدراسة، التخصص، المعدل، ومتطلبات اللغة.",
    href: "/scholarships?sort=match",
    cta: "المنح الأعلى توافقاً",
  },
  {
    icon: Bookmark,
    title: "حفظ المنح ومتابعة المواعيد",
    text: "اضغط أيقونة الحفظ في أي بطاقة منحة لتظهر في صفحة المحفوظات مع عدّاد تنازلي للموعد النهائي، ولون يتغيّر كلما اقترب الموعد.",
    href: "/dashboard/saved",
    cta: "محفوظاتي",
  },
  {
    icon: Sparkles,
    title: "استخدام أدوات الذكاء الاصطناعي",
    text: "الأدوات تقرأ ملفك الأكاديمي تلقائياً. لإنشاء سيرة ذاتية مراجَعة من خبير، استخدم ويزرد السيرة الذاتية المكوّن من خمس خطوات ثم أرسل الطلب.",
    href: "/tools",
    cta: "استعراض الأدوات",
  },
  {
    icon: FileText,
    title: "رفع المستندات",
    text: "ارفع سيرتك الذاتية وخطاب الدافع وسجلاتك الأكاديمية من صفحة المستندات — بالسحب والإفلات أو بالتصفّح. الصيغ المدعومة: PDF، DOC، DOCX، PNG، JPG.",
    href: "/dashboard/documents",
    cta: "مستنداتي",
  },
  {
    icon: Bell,
    title: "التنبيهات والإشعارات",
    text: "تصلك إشعارات المنح المطابقة وتذكيرات المواعيد داخل المنصة. تحكّم بتنبيهات البريد من صفحة الإعدادات.",
    href: "/dashboard/settings",
    cta: "إعدادات التنبيهات",
  },
];

export default function HelpPage() {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 text-center">
          <LifeBuoy className="mx-auto size-10 text-navy-600" strokeWidth={1.6} />
          <h1 className="mt-4 font-display text-3xl font-extrabold text-navy-800">مركز المساعدة</h1>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-relaxed text-ink-500">
            أدلّة مختصرة تشرح كيف تستفيد من كل قسم في المنصة.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <li key={guide.title}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col">
                  <guide.icon className="size-6 text-navy-600" strokeWidth={1.7} />
                  <h2 className="mt-3.5 text-[14.5px] font-bold text-ink-900">{guide.title}</h2>
                  <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-500">
                    {guide.text}
                  </p>
                  <Link
                    href={guide.href}
                    className="mt-4 text-[12.5px] font-bold text-navy-700 hover:underline"
                  >
                    {guide.cta} ←
                  </Link>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl border border-navy-100 bg-navy-50 p-6 text-center">
          <p className="text-[13.5px] text-navy-800">
            لم تجد ما تبحث عنه؟{" "}
            <Link href="/faq" className="font-bold hover:underline">
              راجع الأسئلة الشائعة
            </Link>{" "}
            أو{" "}
            <Link href="/contact" className="font-bold hover:underline">
              تواصل معنا
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
