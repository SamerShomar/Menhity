import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight, Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import { Alert, TipBox } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Input, Textarea } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/Section";
import { LoadingBlock } from "@/components/ui/Spinner";
import { aiApi } from "@/api/endpoints";
import { useApi, useSubmit } from "@/hooks/useApi";
import { TOOL_FORMS } from "@/lib/constants";

export default function ToolRunPage() {
  const { key } = useParams();
  const [input, setInput] = useState("");
  const [target, setTarget] = useState("");
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState(null);

  const { data, loading } = useApi(aiApi.tools, []);
  const run = useSubmit((payload) => aiApi.run(key, payload));

  const tool = (data?.data ?? []).find((item) => item.key === key);
  const form = TOOL_FORMS[key] ?? { needsText: false, showTarget: false, cta: "تشغيل الأداة" };

  const onSubmit = async (event) => {
    event.preventDefault();
    setCopied(false);

    const payload = {};
    if (form.needsText) payload.input = input;
    if (form.showTarget && target.trim()) payload.target = target.trim();

    const { ok, result: response } = await run.submit(payload);
    if (ok) setResult(response);
  };

  const onCopy = async () => {
    await navigator.clipboard?.writeText(result?.output ?? "").catch(() => undefined);
    setCopied(true);
  };

  if (loading) return <LoadingBlock className="py-24" />;

  if (!tool) {
    return (
      <div className="container-page py-16">
        <Alert tone="danger" title="أداة غير معروفة">
          لم نتعرّف على هذه الأداة. اختر أداة من صفحة الأدوات.
        </Alert>
        <ButtonLink to="/tools" variant="outline" className="mt-6">
          <ArrowRight className="size-4" />
          كل الأدوات
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="container-page max-w-5xl">
        <PageHeader
          title={tool.name_ar}
          description={tool.description}
          actions={
            <ButtonLink to="/tools" variant="outline" size="sm">
              <ArrowRight className="size-4" />
              كل الأدوات
            </ButtonLink>
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* النموذج */}
          <Card>
            <CardHeader title="المدخلات" icon={<Icon name={tool.icon} className="size-4" />} />
            <CardBody>
              <Alert tone="info" className="mb-4">
                تعمل الأداة على بيانات ملفك الأكاديمي تلقائياً — كلما اكتمل ملفك كانت النتيجة أدق.
              </Alert>

              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {form.needsText ? (
                  <Textarea
                    label={form.textLabel}
                    placeholder={form.textPlaceholder}
                    rows={12}
                    required
                    counter={20000}
                    hint="٤٠ حرفاً على الأقل."
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    error={run.fieldErrors.input?.[0]}
                  />
                ) : null}

                {form.showTarget ? (
                  <Input
                    label="المنحة أو الجهة المستهدفة"
                    placeholder="مثال: منحة تشيفينينغ البريطانية"
                    hint="اختياري — يساعد في توجيه النص لجهة بعينها."
                    value={target}
                    onChange={(event) => setTarget(event.target.value)}
                    error={run.fieldErrors.target?.[0]}
                  />
                ) : null}

                <Button type="submit" size="lg" className="w-full" loading={run.submitting} loadingText="جارٍ التوليد…">
                  <Sparkles className="size-4" />
                  {form.cta}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* النتيجة */}
          <Card>
            <CardHeader
              title="النتيجة"
              action={
                result ? (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={onCopy}>
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "تم النسخ" : "نسخ"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResult(null);
                        setCopied(false);
                        run.reset();
                      }}
                    >
                      <RotateCcw className="size-4" />
                      مسح
                    </Button>
                  </div>
                ) : null
              }
            />
            <CardBody>
              {run.error ? <Alert tone="danger">{run.error}</Alert> : null}

              {result ? (
                <>
                  {result.mocked ? (
                    <Alert tone="warning" className="mb-4">
                      نسخة توضيحية من وضع المحاكاة — مفتاح الذكاء الاصطناعي غير مضبوط على الخادم.
                    </Alert>
                  ) : null}

                  <pre className="max-h-[520px] overflow-auto glass-soft rounded-xl p-4 text-[13px] leading-8 whitespace-pre-wrap text-ink-800 scrollbar-slim">
                    {result.output}
                  </pre>
                </>
              ) : run.submitting ? (
                <LoadingBlock label="الذكاء الاصطناعي يعمل على ملفك…" />
              ) : (
                <p className="py-12 text-center text-[13px] text-ink-500">
                  ستظهر النتيجة هنا بعد تشغيل الأداة.
                </p>
              )}
            </CardBody>
          </Card>
        </div>

        <TipBox title="قبل أن ترسل النص">
          النص الناتج مسوّدة قوية وليس نسخة نهائية. راجع التواريخ والأسماء والأرقام، واضبط النبرة لتناسب
          الجهة المانحة قبل إرساله ضمن طلبك.
        </TipBox>
      </div>
    </div>
  );
}
