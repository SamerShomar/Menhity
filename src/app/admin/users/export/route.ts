import { NextResponse } from "next/server";

import { getCurrentUser, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { USER_ROLE_LABELS, USER_STATUS_LABELS } from "@/lib/constants";

/** يهرّب الحقل لصيغة CSV آمنة */
function csvCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminRole(user.role)) {
    return NextResponse.json({ error: "غير مصرّح" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      fullName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
      lastLoginAt: true,
      profile: { select: { country: true, completionPercent: true } },
    },
  });

  const header = [
    "الاسم",
    "البريد الإلكتروني",
    "الهاتف",
    "نوع الحساب",
    "الحالة",
    "الدولة",
    "اكتمال الملف %",
    "تاريخ التسجيل",
    "آخر دخول",
  ];

  const lines = [
    header.map(csvCell).join(","),
    ...users.map((u) =>
      [
        u.fullName,
        u.email,
        u.phone ?? "",
        USER_ROLE_LABELS[u.role],
        USER_STATUS_LABELS[u.status],
        u.profile?.country ?? "",
        u.profile?.completionPercent ?? 0,
        u.createdAt.toISOString().slice(0, 10),
        u.lastLoginAt ? u.lastLoginAt.toISOString().slice(0, 10) : "",
      ]
        .map(csvCell)
        .join(","),
    ),
  ];

  // BOM حتى يفتح Excel الملف بترميز UTF-8 ويعرض العربية بشكل صحيح
  const csv = `﻿${lines.join("\n")}`;
  const filename = `menhity-users-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
