"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markAllReadAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

export async function markReadAction(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.notification.updateMany({
    where: { id, userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/notifications");
}
