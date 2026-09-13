import { SignJWT, jwtVerify } from "jose";

/**
 * توقيع الجلسات — يعمل في بيئة Edge (middleware) وفي الخادم معاً.
 * لا يلمس قاعدة البيانات إطلاقاً.
 */

export const SESSION_COOKIE = "menhity_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 يوماً

export type SessionPayload = {
  sub: string; // معرّف المستخدم
  sid: string; // معرّف الجلسة في قاعدة البيانات
  role: "STUDENT" | "EXPERT" | "MODERATOR" | "ADMIN";
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "متغيّر البيئة AUTH_SECRET غير معرّف أو قصير جداً (32 حرفاً على الأقل). راجع ملف .env",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ sid: payload.sid, role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("menhity")
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: "menhity" });
    if (!payload.sub || typeof payload.sid !== "string") return null;
    return {
      sub: payload.sub,
      sid: payload.sid,
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}
