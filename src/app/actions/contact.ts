"use server";

import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { fail, succeed, zodErrors, type FormState } from "@/lib/form-state";

export async function sendContactAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return fail("يرجى تصحيح الحقول المُعلّمة.", zodErrors(parsed.error));
  }

  await prisma.contactMessage.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject ?? null,
      body: parsed.data.body,
    },
  });

  return succeed("تم استلام رسالتك — سنرد عليك على بريدك الإلكتروني قريباً.");
}
