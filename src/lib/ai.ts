import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { AI_TOOLS, type AiToolKey } from "@/lib/constants";

/**
 * طبقة أدوات الذكاء الاصطناعي.
 *
 * إذا كان ANTHROPIC_API_KEY معرّفاً تُستخدم واجهة Claude الفعلية،
 * وإلا تعمل الأدوات بوضع المحاكاة (mock) حتى يبقى المشروع قابلاً
 * للتشغيل محلياً دون مفتاح.
 */

const MODEL = "claude-opus-5";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

/* ------------------------------------------------------------
   تعليمات كل أداة
   ------------------------------------------------------------ */

const SYSTEM_PROMPTS: Record<AiToolKey, string> = {
  "cv-builder": `أنت مساعد أكاديمي متخصص في كتابة السير الذاتية للتقديم على المنح الدراسية الدولية.
اكتب بالعربية الفصحى المهنية، بأسلوب موجز ومباشر.
ركّز على الإنجازات القابلة للقياس بالأرقام، واستخدم أفعالاً قوية.
راعِ معايير الفرز الآلي (ATS) المعتمدة لدى برامج المنح الكبرى مثل DAAD و Chevening والمنحة التركية.
أعد النص النهائي فقط دون مقدمات أو شروحات.`,

  "cv-enhancer": `أنت مراجع أكاديمي للسير الذاتية المقدَّمة لبرامج المنح الدولية.
حلّل النص المُعطى، ثم أعد:
1. ملخص نقاط القوة.
2. قائمة محددة بالتحسينات المقترحة، كل نقطة مع سبب واضح.
3. النسخة المحسّنة من النص.
اكتب بالعربية الفصحى المهنية دون مقدمات.`,

  "letter-builder": `أنت كاتب خطابات دافع (Motivation Letter) للمنح الدراسية.
اكتب خطاباً متماسكاً من ثلاث إلى خمس فقرات: الدافع، الخلفية الأكاديمية والمهنية، سبب اختيار هذه المنحة تحديداً، والخطة المستقبلية.
اربط دائماً بين خلفية المتقدّم ومتطلبات المنحة. اكتب بالعربية الفصحى دون عبارات إنشائية مبالغ فيها.
أعد نص الخطاب فقط.`,

  "letter-enhancer": `أنت مراجع لخطابات الدافع المقدَّمة للمنح الدراسية.
حلّل الخطاب المُعطى من حيث: وضوح الدافع، الترابط، الملاءمة للمنحة، والأسلوب اللغوي.
أعد: ملخص التقييم، ثم قائمة تحسينات محددة، ثم النسخة المحسّنة.
اكتب بالعربية الفصحى دون مقدمات.`,

  "profile-review": `أنت مقيّم ملفات أكاديمية لأغراض التقديم على المنح الدولية.
قيّم جاهزية الملف المُعطى، وأعد:
1. تقييم عام من 100 مع تبرير مختصر.
2. أبرز نقاط القوة.
3. الفجوات التي تحتاج معالجة، مرتّبة حسب الأولوية.
4. خطوات عملية محددة لتحسين الملف خلال الأشهر الثلاثة القادمة.
اكتب بالعربية الفصحى دون مقدمات.`,
};

/* ------------------------------------------------------------
   وضع المحاكاة — نصوص جاهزة عند غياب المفتاح
   ------------------------------------------------------------ */

function mockOutput(key: AiToolKey, input: Record<string, unknown>): string {
  const name = typeof input.fullName === "string" ? input.fullName : "المتقدّم";

  switch (key) {
    case "cv-builder":
      return `النبذة الأكاديمية
${name} — خرّيج متميّز يجمع بين الأساس الأكاديمي القوي والخبرة البحثية التطبيقية، ويسعى إلى إكمال دراساته العليا في مؤسسة بحثية دولية.

أبرز الإنجازات
• حافظ على معدل تراكمي ضمن أعلى 10% من الدفعة طوال سنوات الدراسة.
• قاد فريقاً من 4 أعضاء في مشروع تخرّج حصد المركز الأول على مستوى الجامعة.
• شارك في نشاط بحثي أسهم في تحليل بيانات تجاوزت 15,000 سجل.

المهارات الأساسية
البحث العلمي والتوثيق الأكاديمي · تحليل البيانات · القيادة وإدارة المشاريع · الكتابة الأكاديمية

— هذه نسخة تجريبية مولّدة بوضع المحاكاة. لتفعيل التوليد الفعلي أضف ANTHROPIC_API_KEY في ملف .env —`;

    case "cv-enhancer":
      return `نقاط القوة
• البنية العامة للسيرة واضحة ومقسّمة بشكل منطقي.
• الخلفية الأكاديمية مذكورة بتفصيل كافٍ.

التحسينات المقترحة
1. استبدل العبارات العامة بأرقام ونتائج ملموسة — "حسّنت الأداء" تصبح "رفعت دقة النموذج من 82% إلى 94%".
2. ابدأ كل نقطة بفعل قوي: قاد، طوّر، صمّم، حلّل.
3. اختصر النبذة إلى 3 أسطر كحد أقصى وركّزها على هدفك من المنحة.
4. أضف قسماً مستقلاً للشهادات الدولية مع أرقام الاعتماد.

— نسخة تجريبية (وضع المحاكاة) —`;

    case "letter-builder":
      return `إلى لجنة اختيار المنحة الموقّرة،

أكتب إليكم لأتقدّم بطلبي للالتحاق بهذا البرنامج، الذي أراه امتداداً طبيعياً لمسار أكاديمي بنيته على مدى السنوات الماضية في مجال تخصصي.

خلال دراستي الجامعية، لم أكتفِ بالمقررات النظرية، بل انخرطت في مشاريع بحثية تطبيقية منحتني فهماً عملياً لتحديات المجال. وقد عزّزت هذه التجربة قناعتي بأن الدراسات العليا في بيئة بحثية متقدمة هي الخطوة التالية الضرورية.

اخترت هذه المنحة تحديداً لما يتميّز به البرنامج من توجّه بحثي يتقاطع مباشرة مع اهتماماتي، ولما توفّره من بيئة أكاديمية تجمع باحثين من خلفيات متنوعة.

وأتطلّع بعد إتمام الدراسة إلى توظيف ما اكتسبته في خدمة مجتمعي، عبر المساهمة في البحث العلمي ونقل المعرفة.

مع خالص التقدير،
${name}

— نسخة تجريبية (وضع المحاكاة) —`;

    case "letter-enhancer":
      return `التقييم العام
الخطاب متماسك في بنيته العامة، لكنه يحتاج إلى ربط أوضح بين خلفيتك ومتطلبات المنحة تحديداً.

التحسينات المقترحة
1. اذكر اسم البرنامج وميزة محددة فيه بدل العبارات العامة عن "البيئة الأكاديمية المتميزة".
2. أضف مثالاً واحداً ملموساً من تجربتك يبرهن على دافعك.
3. اختصر الفقرة الافتتاحية — ادخل في الموضوع من السطر الأول.
4. اجعل الفقرة الختامية محددة: ماذا ستفعل بالضبط بعد التخرّج.

— نسخة تجريبية (وضع المحاكاة) —`;

    case "profile-review":
      return `التقييم العام: 72 / 100
ملف واعد بأساس أكاديمي جيد، لكنه يفتقد بعض العناصر التي تبحث عنها لجان المنح.

نقاط القوة
• معدل تراكمي تنافسي.
• وجود نشاط بحثي موثّق.

الفجوات حسب الأولوية
1. غياب شهادة لغة معتمدة سارية (أيلتس / توفل) — تُشترط في أغلب المنح الممولة بالكامل.
2. عدد خطابات التوصية غير كافٍ.
3. النبذة الشخصية عامة ولا تعكس هدفاً بحثياً محدداً.

خطوات الثلاثة أشهر القادمة
• سجّل في اختبار أيلتس واستهدف 7.0 على الأقل.
• تواصل مع مشرفين أكاديميين لطلب خطابي توصية.
• اكتب بياناً بحثياً من 300 كلمة يحدد سؤالك البحثي.

— نسخة تجريبية (وضع المحاكاة) —`;
  }
}

/* ------------------------------------------------------------
   التنفيذ
   ------------------------------------------------------------ */

export type AiRunResult = {
  ok: boolean;
  output: string;
  runId: string | null;
  mocked: boolean;
  error?: string;
};

export async function runAiTool(
  key: AiToolKey,
  userPrompt: string,
  options: { userId?: string; input?: Record<string, unknown> } = {},
): Promise<AiRunResult> {
  const meta = AI_TOOLS.find((t) => t.key === key);
  if (!meta) {
    return { ok: false, output: "", runId: null, mocked: false, error: "أداة غير معروفة" };
  }

  const tool = await prisma.aiTool.findUnique({ where: { key } });
  const startedAt = Date.now();

  const run = tool
    ? await prisma.aiToolRun.create({
        data: {
          toolId: tool.id,
          userId: options.userId ?? null,
          status: "RUNNING",
          input: (options.input ?? {}) as never,
        },
      })
    : null;

  // --- وضع المحاكاة ---
  if (!isAiConfigured()) {
    const output = mockOutput(key, options.input ?? {});
    if (run) {
      await prisma.aiToolRun.update({
        where: { id: run.id },
        data: { status: "SUCCESS", output, durationMs: Date.now() - startedAt },
      });
    }
    return { ok: true, output, runId: run?.id ?? null, mocked: true };
  }

  // --- الاتصال الفعلي بـ Claude ---
  try {
    const stream = getClient().messages.stream({
      model: MODEL,
      max_tokens: 8000,
      system: SYSTEM_PROMPTS[key],
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: userPrompt }],
    });

    const message = await stream.finalMessage();

    if (message.stop_reason === "refusal") {
      throw new Error("تعذّر إنتاج المحتوى لهذا الطلب.");
    }

    const output = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (run) {
      await prisma.aiToolRun.update({
        where: { id: run.id },
        data: { status: "SUCCESS", output, durationMs: Date.now() - startedAt },
      });
    }

    return { ok: true, output, runId: run?.id ?? null, mocked: false };
  } catch (error) {
    const errorMessage =
      error instanceof Anthropic.APIError
        ? `خطأ من مزوّد الذكاء الاصطناعي (${error.status}): ${error.message}`
        : error instanceof Error
          ? error.message
          : "خطأ غير معروف";

    if (run) {
      await prisma.aiToolRun.update({
        where: { id: run.id },
        data: {
          status: "FAILED",
          errorMessage,
          durationMs: Date.now() - startedAt,
        },
      });
    }

    return { ok: false, output: "", runId: run?.id ?? null, mocked: false, error: errorMessage };
  }
}

/* ------------------------------------------------------------
   تقرير توافق ATS — يُحسب محلياً دون اتصال خارجي
   ------------------------------------------------------------ */

export type AtsReport = {
  score: number;
  checks: Array<{ label: string; passed: boolean }>;
};

export function computeAtsReport(data: {
  hasSummary: boolean;
  educationCount: number;
  experienceCount: number;
  skillCount: number;
  hasLanguageCertificate: boolean;
  quantifiedAchievements: boolean;
}): AtsReport {
  const checks = [
    {
      label: "هيكلية نظيفة بنمط نصّي مقروء من قبل كافة برمجيات الفرز الدولية.",
      passed: data.educationCount > 0 && data.experienceCount > 0,
    },
    {
      label: "صياغة الإنجازات باستخدام أفعال قوية ونتائج عددية واضحة.",
      passed: data.quantifiedAchievements,
    },
    {
      label: "تطابق الكلمات المفتاحية مع معايير المنح البحثية العالمية (DAAD و Chevening).",
      passed: data.skillCount >= 4 && data.hasSummary,
    },
    {
      label: "تضمين مؤشر الكفاءة اللغوية المعتمد دولياً (IELTS / TOEFL).",
      passed: data.hasLanguageCertificate,
    },
  ];

  const passed = checks.filter((c) => c.passed).length;
  // 60 كحد أدنى + 10 لكل فحص ناجح
  const score = Math.min(98, 60 + passed * 10);

  return { score, checks };
}
