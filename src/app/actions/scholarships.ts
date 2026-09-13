"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** حفظ المنحة أو إزالتها من المحفوظات */
export async function toggleSaveAction(scholarshipId: string): Promise<{ saved: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { saved: false };

  const existing = await prisma.savedScholarship.findUnique({
    where: { userId_scholarshipId: { userId: user.id, scholarshipId } },
  });

  if (existing) {
    await prisma.savedScholarship.delete({ where: { id: existing.id } });
  } else {
    await prisma.savedScholarship.create({ data: { userId: user.id, scholarshipId } });
  }

  revalidatePath("/dashboard/saved");
  revalidatePath("/scholarships");
  revalidatePath(`/scholarships/${scholarshipId}`);

  return { saved: !existing };
}
