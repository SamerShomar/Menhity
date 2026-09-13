"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, UploadCloud } from "lucide-react";

import { uploadDocumentAction } from "@/app/actions/documents";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { DOCUMENT_KIND_LABELS, UPLOAD } from "@/lib/constants";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn, formatFileSize } from "@/lib/utils";

export function DocumentUploader() {
  const [state, formAction] = useActionState(uploadDocumentAction, EMPTY_FORM_STATE);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // تفريغ النموذج بعد نجاح الرفع
  useEffect(() => {
    if (state.ok) {
      setFile(null);
      formRef.current?.reset();
    }
  }, [state]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);

    const dropped = e.dataTransfer.files?.[0];
    if (!dropped || !inputRef.current) return;

    // نقل الملف المسحوب إلى حقل الإدخال ليُرسل مع النموذج
    const transfer = new DataTransfer();
    transfer.items.add(dropped);
    inputRef.current.files = transfer.files;
    setFile(dropped);
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={cn(
          "flex min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-navy-500 bg-navy-50" : "border-ink-300 bg-ink-50 hover:border-navy-400",
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-white text-navy-600 shadow-sm">
          {file ? <UploadCloud className="size-5" /> : <Plus className="size-5" />}
        </span>

        {file ? (
          <>
            <p className="mt-3 max-w-full truncate text-[13px] font-bold text-ink-800">{file.name}</p>
            <p className="num mt-1 text-[11.5px] text-ink-500">{formatFileSize(file.size)}</p>
          </>
        ) : (
          <>
            <p className="mt-3 text-[13px] font-bold text-ink-800">إضافة مستند جديد</p>
            <p className="mt-1 text-[11.5px] text-ink-500">
              اسحب وأفلت الملف هنا أو انقر للتصفّح
            </p>
            <p className="mt-2 text-[10.5px] text-ink-400">
              PDF · DOC · DOCX · PNG · JPG — حتى <span className="num">10</span> ميجابايت
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          name="file"
          className="sr-only"
          accept={UPLOAD.allowedExt.join(",")}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {state.message && (
        <Alert tone={state.ok ? "success" : "danger"}>{state.message}</Alert>
      )}

      {file && (
        <div className="space-y-3">
          <Select name="kind" label="نوع المستند" defaultValue="CV">
            {Object.entries(DOCUMENT_KIND_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>

          <SubmitButton fullWidth pendingText="جارٍ الرفع…">
            رفع المستند
          </SubmitButton>
        </div>
      )}
    </form>
  );
}
