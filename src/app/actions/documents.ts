"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import type { DocumentKind } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UPLOAD } from "@/lib/constants";
import { fail, succeed, type FormState } from "@/lib/form-state";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const VALID_KINDS: DocumentKind[] = [
  "CV",
  "MOTIVATION_LETTER",
  "TRANSCRIPT",
  "RECOMMENDATION",
  "PASSPORT",
  "CERTIFICATE",
  "OTHER",
];

export async function uploadDocumentAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return fail("يجب تسجيل الدخول أولاً.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return fail("اختر ملفاً للرفع.");
  }

  if (file.size > UPLOAD.maxBytes) {
    return fail("حجم الملف يتجاوز الحد المسموح به (10 ميجابايت).");
  }

  const ext = path.extname(file.name).toLowerCase();
  const allowedExt: readonly string[] = UPLOAD.allowedExt;
  const allowedMime: readonly string[] = UPLOAD.allowedMime;

  if (!allowedExt.includes(ext) || !allowedMime.includes(file.type)) {
    return fail("صيغة الملف غير مدعومة. الصيغ المقبولة: PDF، DOC، DOCX، PNG، JPG.");
  }

  const kindRaw = String(formData.get("kind") ?? "OTHER") as DocumentKind;
  const kind = VALID_KINDS.includes(kindRaw) ? kindRaw : "OTHER";

  // اسم مخزّن عشوائي يمنع تضارب الأسماء وتجاوز المسار
  const storedName = `${randomUUID()}${ext}`;

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, storedName),
    Buffer.from(await file.arrayBuffer()),
  );

  await prisma.document.create({
    data: {
      userId: user.id,
      kind,
      originalName: file.name,
      storedName,
      mimeType: file.type,
      sizeBytes: file.size,
      url: `/uploads/${storedName}`,
    },
  });

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");

  return succeed("تم رفع المستند بنجاح.");
}

export async function deleteDocumentAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const doc = await prisma.document.findFirst({ where: { id, userId: user.id } });
  if (!doc) return;

  await prisma.document.delete({ where: { id: doc.id } });

  // حذف الملف من القرص — نتجاهل الخطأ إن كان محذوفاً مسبقاً
  await unlink(path.join(UPLOAD_DIR, doc.storedName)).catch(() => undefined);

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}
