import "server-only";

import { createHash, randomBytes, randomInt } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
} from "@/lib/jwt";

/* ------------------------------------------------------------
   كلمات المرور
   ------------------------------------------------------------ */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/* ------------------------------------------------------------
   رموز التحقق (6 أرقام)
   ------------------------------------------------------------ */

export function generateVerificationCode(): string {
  return String(randomInt(100_000, 1_000_000));
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/* ------------------------------------------------------------
   قراءة بيانات الجهاز من الطلب — تغذّي شاشة "الأجهزة النشطة"
   ------------------------------------------------------------ */

export type DeviceInfo = {
  userAgent: string | null;
  ipAddress: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
};

export function parseUserAgent(ua: string | null): Omit<DeviceInfo, "userAgent" | "ipAddress"> {
  if (!ua) return { browser: null, os: null, deviceType: null };

  let browser = "متصفح غير معروف";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua)) browser = "Safari";

  let os = "نظام غير معروف";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  const deviceType = /Mobi|Android|iPhone|iPod/i.test(ua)
    ? "mobile"
    : /iPad|Tablet/i.test(ua)
      ? "tablet"
      : "desktop";

  return { browser, os, deviceType };
}

export async function readDeviceInfo(): Promise<DeviceInfo> {
  const h = await headers();
  const userAgent = h.get("user-agent");
  const forwarded = h.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0]!.trim() : h.get("x-real-ip");

  return { userAgent, ipAddress, ...parseUserAgent(userAgent) };
}

/* ------------------------------------------------------------
   إنشاء الجلسة وإنهاؤها
   ------------------------------------------------------------ */

export async function createSession(userId: string, role: UserRole): Promise<void> {
  const device = await readDeviceInfo();
  const rawToken = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      userAgent: device.userAgent,
      ipAddress: device.ipAddress,
      browser: device.browser,
      os: device.os,
      deviceType: device.deviceType,
      expiresAt,
    },
  });

  const jwt = await signSessionToken({ sub: userId, sid: session.id, role });

  const store = await cookies();
  store.set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) {
      await prisma.session
        .update({ where: { id: payload.sid }, data: { revokedAt: new Date() } })
        .catch(() => undefined);
    }
  }

  store.delete(SESSION_COOKIE);
}

/* ------------------------------------------------------------
   قراءة المستخدم الحالي
   ------------------------------------------------------------ */

export type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  sessionId: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const session = await prisma.session.findUnique({
    where: { id: payload.sid },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) return null;
  if (session.user.status === "SUSPENDED") return null;

  // تحديث آخر نشاط — مرة كل 5 دقائق على الأكثر لتقليل الكتابة
  if (Date.now() - session.lastActiveAt.getTime() > 5 * 60 * 1000) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastActiveAt: new Date() } })
      .catch(() => undefined);
  }

  return {
    id: session.user.id,
    email: session.user.email,
    fullName: session.user.fullName,
    avatarUrl: session.user.avatarUrl,
    role: session.user.role,
    sessionId: session.id,
  };
}

/** يعيد التوجيه لتسجيل الدخول إذا لم يكن المستخدم مسجّلاً */
export async function requireUser(redirectTo = "/login"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(redirectTo);
  return user;
}

/** يشترط دوراً معيّناً — يُستخدم لحماية لوحة الإدارة */
export async function requireRole(...roles: UserRole[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}
