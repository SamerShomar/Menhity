import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Info } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { getOrCreateProfile } from "@/lib/student-data";
import { computeCompletion } from "@/lib/profile-completion";
import { AI_TOOLS, type AiToolKey } from "@/lib/constants";
import { isAiConfigured } from "@/lib/ai";

import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ToolRunner } from "@/components/tools/tool-runner";

/** إعدادات النموذج الخاصة بكل أداة */
const CONFIG: Record<
  Exclude<AiToolKey, "cv-builder">,
  {
    needsText: boolean;
    textLabel?: string;
    textPlaceholder?: string;
    showTarget: boolean;
    cta: string;
  }
> = {
  "cv-enhancer": {
    needsText: true,
    textLabel: "الصق نص سيرتك الذاتية الحالية",
    textPlaceholder: "انسخ محتوى سيرتك الذاتية والصقه هنا…",
    showTarget: true,
    cta: "حلّل وحسّن السيرة الذاتية",
  },
  "letter-builder": {
    needsText: false,
    showTarget: true,
    cta: "توليد خطاب الدافع",
  },
  "letter-enhancer": {
    needsText: true,
    textLabel: "الصق نص خطاب الدافع",
    textPlaceholder: "انسخ خطاب الدافع الحالي والصقه هنا…",
    showTarget: true,
    cta: "حلّل وحسّن الخطاب",
  },
  "profile-review": {
    needsText: false,
    showTarget: false,
    cta: "قيّم ملفي الأكاديمي",
  },
};

type Params = { params: Promise<{ tool: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tool } = await params;
  const meta = AI_TOOLS.find((t) => t.key === tool);
  return meta ? { title: meta.nameAr, description: meta.description } : { title: "أداة غير موجودة" };
}

export default async function ToolPage({ params }: Params) {
  const { tool } = await params;

  const meta = AI_TOOLS.find((t) => t.key === tool);
  const config = CONFIG[tool as Exclude<AiToolKey, "cv-builder">];
  if (!meta || !config) notFound();

  const user = await requireUser();
  const profile = await getOrCreateProfile(user.id);
  const { percent } = computeCompletion(profile);

  return (
    <div className="container-page py-10">
      <nav aria-label="مسار التنقّل" className="mb-5 flex items-center gap-1.5 text-[12.5px] text-ink-500">
        <Link href="/tools" className="hover:text-navy-700">
          أدوات الذكاء الاصطناعي
        </Link>
        <ChevronLeft className="size-3.5" />
        <span className="font-semibold text-ink-800">{meta.nameAr}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <header className="mb-7 flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy-700 text-white">
            <Icon name={meta.icon} className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-navy-800">{meta.nameAr}</h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-ink-500">{meta.description}</p>
          </div>
        </header>

        {percent < 50 && (
          <Alert tone="info" className="mb-5">
            <span className="flex flex-wrap items-center gap-2">
              ملفك الأكاديمي مكتمل بنسبة <span className="num font-bold">{percent}%</span> فقط —
              أكمله للحصول على مخرجات أدق.
              <Link href="/dashboard/profile" className="font-bold underline">
                إكمال الملف
              </Link>
            </span>
          </Alert>
        )}

        {!isAiConfigured() && (
          <Alert tone="warning" className="mb-5">
            وضع المحاكاة مفعّل — أضف <code className="font-mono">ANTHROPIC_API_KEY</code> في ملف{" "}
            <code className="font-mono">.env</code> لتفعيل التوليد الفعلي.
          </Alert>
        )}

        <ToolRunner
          toolKey={meta.key}
          needsText={config.needsText}
          textLabel={config.textLabel}
          textPlaceholder={config.textPlaceholder}
          showTarget={config.showTarget}
          ctaLabel={config.cta}
        />

        <div className="mt-8 flex items-start gap-2.5 rounded-xl border border-ink-200 bg-white p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-navy-500" />
          <p className="text-[12px] leading-relaxed text-ink-500">
            تقرأ الأداة بيانات ملفك الأكاديمي تلقائياً (التعليم، الخبرات، المهارات، اللغات) وتستخدمها
            كسياق للتوليد. راجع الناتج دائماً وعدّله قبل استخدامه في التقديم الفعلي.
          </p>
        </div>

        <div className="mt-5 text-center">
          <ButtonLink href="/tools" variant="ghost" size="sm">
            استعراض بقية الأدوات
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
