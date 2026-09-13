"use server";

import { requireUser } from "@/lib/auth";
import { runAiTool } from "@/lib/ai";
import { getOrCreateProfile } from "@/lib/student-data";
import { AI_TOOLS, DEGREE_LABELS, type AiToolKey } from "@/lib/constants";
import { formatGpa } from "@/lib/utils";
import { fail, type FormState } from "@/lib/form-state";

/** ملخّص نصّي للملف الأكاديمي يُمرَّر كسياق للأداة */
function summarizeProfile(profile: Awaited<ReturnType<typeof getOrCreateProfile>>): string {
  const lines: string[] = [];

  lines.push(`الاسم: ${profile.fullNameAr ?? "—"}`);
  if (profile.fullNameEn) lines.push(`الاسم بالإنجليزية: ${profile.fullNameEn}`);
  if (profile.country) lines.push(`البلد: ${profile.country}${profile.city ? `، ${profile.city}` : ""}`);
  if (profile.bio) lines.push(`النبذة: ${profile.bio}`);

  if (profile.educations.length) {
    lines.push("\nالتعليم:");
    for (const e of profile.educations) {
      lines.push(
        `- ${DEGREE_LABELS[e.degree]}${e.major ? ` في ${e.major}` : ""} — ${e.institution}` +
          `${e.graduationYear ? ` (${e.graduationYear})` : ""}` +
          `${e.gpaValue != null ? ` — المعدل ${formatGpa(e.gpaValue, e.gpaScale)}` : ""}`,
      );
    }
  }

  if (profile.experiences.length) {
    lines.push("\nالخبرات:");
    for (const x of profile.experiences) {
      lines.push(`- ${x.title} — ${x.organization}${x.description ? `: ${x.description}` : ""}`);
    }
  }

  if (profile.skills.length) {
    lines.push(`\nالمهارات: ${profile.skills.map((s) => s.name).join("، ")}`);
  }

  if (profile.languages.length) {
    lines.push(
      `اللغات: ${profile.languages
        .map((l) => `${l.name} (${l.proficiency}${l.certificate ? ` — ${l.certificate}` : ""})`)
        .join("، ")}`,
    );
  }

  if (profile.certifications.length) {
    lines.push(`الشهادات: ${profile.certifications.map((c) => c.title).join("، ")}`);
  }

  if (profile.projects.length) {
    lines.push("\nالمشاريع والإنجازات:");
    for (const p of profile.projects) {
      lines.push(`- ${p.title}${p.description ? `: ${p.description}` : ""}`);
    }
  }

  return lines.join("\n");
}

export type AiFormState = FormState & { output?: string; mocked?: boolean };

export async function runToolAction(
  _prev: AiFormState,
  formData: FormData,
): Promise<AiFormState> {
  const user = await requireUser();

  const key = String(formData.get("tool") ?? "") as AiToolKey;
  if (!AI_TOOLS.some((t) => t.key === key)) {
    return fail("أداة غير معروفة.");
  }

  const userText = String(formData.get("input") ?? "").trim();
  const target = String(formData.get("target") ?? "").trim();

  // الأدوات التحليلية تحتاج نصاً من المستخدم
  if ((key === "cv-enhancer" || key === "letter-enhancer") && userText.length < 40) {
    return fail("الصق النص المراد تحسينه (40 حرفاً على الأقل).");
  }

  const profile = await getOrCreateProfile(user.id);
  const summary = summarizeProfile(profile);

  const sections = [`بيانات الملف الأكاديمي:\n${summary}`];
  if (target) sections.push(`\nالمنحة أو الجهة المستهدفة: ${target}`);
  if (userText) sections.push(`\nالنص المُقدَّم من المستخدم:\n${userText}`);

  const result = await runAiTool(key, sections.join("\n"), {
    userId: user.id,
    input: { target: target || undefined, hasUserText: Boolean(userText) },
  });

  if (!result.ok) {
    return fail(result.error ?? "تعذّر تنفيذ الأداة. حاول مجدداً.");
  }

  return { ok: true, output: result.output, mocked: result.mocked };
}
