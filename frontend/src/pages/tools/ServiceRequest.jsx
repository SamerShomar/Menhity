import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Sparkles, Upload, UserCheck } from "lucide-react";

import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/Section";
import { cvOrderApi } from "@/api/endpoints";
import { useSubmit } from "@/hooks/useApi";
import { cn, formatFileSize } from "@/lib/utils";

/** الخدمتان اللتان تبدآن من ملف يرفعه الطالب */
const KINDS = [
  {
    key: "cv_improve",
    label: "تحسين سيرة ذاتية",
    hint: "أرفق سيرتك الحالية ليعيد الفريق صياغتها وتنسيقها.",
    icon: FileText,
  },
  {
    key: "letter_improve",
    label: "تحسين خطاب دافع",
    hint: "أرفق خطابك ليراجعه الفريق ويقوّي حججه وأسلوبه.",
    icon: Sparkles,
  },
];

const ACCEPT = ".pdf,.doc,.docx";

export default function ServiceRequestPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [kind, setKind] = useState(
    KINDS.some((k) => k.key === params.get("kind")) ? params.get("kind") : KINDS[0].key,
  );
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");

  const { submit, submitting, error, fieldErrors } = useSubmit(cvOrderApi.submit);

  const onSubmit = async (event) => {
    event.preventDefault();
    const { ok, result } = await submit({ kind, file, note });

    if (ok) navigate(`/tools/cv-builder/${result.data.id}`);
  };

  return (
    <div className="py-10">
      <div className="container-page max-w-3xl">
        <PageHeader
          title="طلب خدمة يدوية"
          description="يعمل فريق منحتي على ملفك بنفسه ويسلّمك نسخة جاهزة — مجاناً."
        />

        {error ? (
          <Alert tone="danger" className="mb-5">
            {fieldErrors.file?.[0] ?? error}
          </Alert>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-5">
          <Card>
            <CardHeader title="نوع الخدمة" icon={<UserCheck className="size-4" />} />
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {KINDS.map((item) => {
                const active = kind === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setKind(item.key)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-xl p-4 text-start transition",
                      active
                        ? "glass-gold text-navy-900"
                        : "glass-soft hover:bg-white/60",
                    )}
                  >
                    <item.icon className="size-5" />
                    <p className="mt-2 text-[13.5px] font-bold">{item.label}</p>
                    <p className="mt-1 text-[12px] leading-6 opacity-80">{item.hint}</p>
                  </button>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="ملفك الحالي"
              subtitle="PDF أو Word، حتى 10 ميجابايت."
              icon={<Upload className="size-4" />}
            />
            <CardBody>
              <label
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center transition",
                  file
                    ? "border-[color:var(--color-success)]/50 bg-[color:var(--color-success)]/8"
                    : "border-ink-900/20 hover:bg-white/60",
                )}
              >
                <input
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
                <Upload className="size-7 text-navy-600" />
                {file ? (
                  <>
                    <span className="text-[13.5px] font-bold text-navy-800">{file.name}</span>
                    <span className="num text-[12px] text-ink-500">{formatFileSize(file.size)}</span>
                    <span className="text-[12px] text-ink-500">اضغط لاختيار ملف آخر</span>
                  </>
                ) : (
                  <>
                    <span className="text-[13.5px] font-semibold text-navy-800">اختر ملفاً من جهازك</span>
                    <span className="text-[12px] text-ink-500">PDF · DOC · DOCX</span>
                  </>
                )}
              </label>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Textarea
                label="ملاحظات للفريق"
                rows={4}
                counter={1000}
                placeholder="مثال: أرجو إبراز خبرتي البحثية، وأتقدّم لمنحة ماجستير في هولندا."
                value={note}
                onChange={(event) => setNote(event.target.value)}
                error={fieldErrors.note?.[0]}
              />
            </CardBody>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" size="lg" loading={submitting} disabled={!file}>
              إرسال الطلب
            </Button>
            <ButtonLink to="/tools" variant="outline" size="lg">
              رجوع للأدوات
            </ButtonLink>
          </div>

          {!file ? (
            <p className="text-[12.5px] text-ink-500">أرفق ملفك أولاً ليتمكّن الفريق من العمل عليه.</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
