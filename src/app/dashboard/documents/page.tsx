import type { Metadata } from "next";
import { Download, FileText, Trash2 } from "lucide-react";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteDocumentAction } from "@/app/actions/documents";
import { DOCUMENT_KIND_LABELS } from "@/lib/constants";
import { formatDateAr, formatFileSize } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { DocumentUploader } from "@/components/dashboard/document-uploader";

export const metadata: Metadata = { title: "المستندات المرفقة" };

const KIND_TONES: Record<string, "navy" | "gold" | "info" | "neutral"> = {
  CV: "navy",
  MOTIVATION_LETTER: "gold",
  TRANSCRIPT: "info",
};

export default async function DocumentsPage() {
  const user = await requireUser();

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink-900">المستندات المرفقة</h1>
        <p className="mt-2 text-[13.5px] text-ink-500">
          ارفق ملفاتك العامة — السيرة الذاتية، خطاب الدافع، السجلات الأكاديمية — لتكون جاهزة
          للتقديم السريع.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {documents.map((doc) => (
          <article
            key={doc.id}
            className="flex flex-col rounded-2xl border border-ink-200 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="flex size-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                <FileText className="size-5" />
              </span>

              <div className="flex items-center gap-1">
                <a
                  href={doc.url}
                  download={doc.originalName}
                  aria-label={`تنزيل ${doc.originalName}`}
                  className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-navy-700"
                >
                  <Download className="size-4" />
                </a>

                <form action={deleteDocumentAction}>
                  <input type="hidden" name="id" value={doc.id} />
                  <button
                    type="submit"
                    aria-label={`حذف ${doc.originalName}`}
                    className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </form>
              </div>
            </div>

            <p className="truncate text-[13px] font-bold text-ink-900" dir="ltr" title={doc.originalName}>
              {doc.originalName}
            </p>
            <p className="num mt-1.5 text-[11px] text-ink-400">
              تم الرفع {formatDateAr(doc.createdAt)}
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
              <Badge tone={KIND_TONES[doc.kind] ?? "neutral"}>
                {DOCUMENT_KIND_LABELS[doc.kind]}
              </Badge>
              <span className="num text-[11px] text-ink-400">{formatFileSize(doc.sizeBytes)}</span>
            </div>
          </article>
        ))}

        {/* بطاقة الرفع */}
        <div className="rounded-2xl">
          <DocumentUploader />
        </div>
      </div>
    </div>
  );
}
