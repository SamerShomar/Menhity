import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AI_TOOLS } from "@/lib/constants";
import { isAiConfigured } from "@/lib/ai";
import { formatNumber } from "@/lib/utils";

import { Alert } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "أدوات الذكاء الاصطناعي",
  description:
    "أدوات ذكية لإنشاء السيرة الذاتية وخطاب الدافع وتقييم ملفك الأكاديمي استعداداً للتقديم على المنح.",
};

export default async function ToolsPage() {
  const tools = await prisma.aiTool.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { runs: true } } },
  });

  // نعرض الأدوات المفعّلة في قاعدة البيانات، ونعود للقائمة الثابتة إن كانت فارغة
  const items =
    tools.length > 0
      ? tools.map((t) => {
          const meta = AI_TOOLS.find((a) => a.key === t.key);
          return {
            key: t.key,
            nameAr: t.nameAr,
            description: t.description ?? meta?.description ?? "",
            icon: t.icon ?? meta?.icon ?? "Sparkles",
            href: meta?.href ?? `/tools/${t.key}`,
            runs: t._count.runs,
          };
        })
      : AI_TOOLS.map((t) => ({ ...t, runs: 0 }));

  return (
    <>
      <section className="border-b border-ink-200 bg-white py-14">
        <div className="container-page">
          <SectionHeading
            eyebrow="مدعومة بالذكاء الاصطناعي"
            title="أدوات ذكية تجعل التقديم أسهل"
            description="جهّز مستنداتك الأكاديمية بمعايير المنح الدولية — من السيرة الذاتية وخطاب الدافع إلى تقييم جاهزية ملفك."
          />
        </div>
      </section>

      <section className="container-page py-12">
        {!isAiConfigured() && (
          <Alert tone="warning" className="mb-6" title="وضع المحاكاة مفعّل">
            لم يُضبط مفتاح مزوّد الذكاء الاصطناعي (ANTHROPIC_API_KEY)، لذا تعمل الأدوات حالياً
            بنصوص تجريبية. أضف المفتاح في ملف <code className="font-mono">.env</code> لتفعيل
            التوليد الفعلي.
          </Alert>
        )}

        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((tool) => (
            <li key={tool.key}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col rounded-2xl border border-ink-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-navy-300 hover:shadow-[0_16px_40px_-20px_rgb(15_23_42/0.25)]"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-600 transition-colors group-hover:bg-navy-700 group-hover:text-white">
                  <Icon name={tool.icon} className="size-6" />
                </span>

                <h2 className="mt-5 text-[15px] font-bold text-ink-900">{tool.nameAr}</h2>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-ink-500">
                  {tool.description}
                </p>

                <div className="mt-5 flex items-center justify-between border-t border-ink-100 pt-4">
                  <span className="num text-[11.5px] text-ink-400">
                    {formatNumber(tool.runs)} استخدام
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-navy-700">
                    ابدأ
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-400">
          <Sparkles className="size-3.5 text-gold-500" />
          الأدوات تقرأ بيانات ملفك الأكاديمي تلقائياً — أكمل ملفك أولاً للحصول على أفضل نتيجة.
        </p>
      </section>
    </>
  );
}
