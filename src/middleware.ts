import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt";

/**
 * حماية المسارات على مستوى الحافة (Edge).
 * التحقّق النهائي من صلاحية الجلسة يتم في الخادم عبر getCurrentUser()،
 * وهذه الطبقة تمنع الوصول المبكر وتوفّر إعادة توجيه سريعة.
 */

const PROTECTED = ["/dashboard", "/tools", "/admin"];
const ADMIN_ONLY = ["/admin"];
const GUEST_ONLY = ["/login", "/register", "/forgot-password", "/reset-password", "/verify"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isGuestOnly = GUEST_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  // مستخدم غير مسجّل يحاول الوصول لمسار محمي
  if (needsAuth && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // مستخدم مسجّل يحاول فتح صفحات الدخول/التسجيل
  if (isGuestOnly && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // لوحة الإدارة: للمدير والمشرف فقط
  const needsAdmin = ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (needsAdmin && session && session.role !== "ADMIN" && session.role !== "MODERATOR") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * كل المسارات عدا:
     * - ملفات Next الداخلية (_next)
     * - واجهات API (تتحقّق بنفسها)
     * - الملفات الثابتة
     */
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml)$).*)",
  ],
};
