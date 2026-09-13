import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** دمج أصناف Tailwind مع حلّ التعارضات */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

/** 17 سبتمبر 2026 */
export function formatDateAr(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** سبتمبر 2026 */
export function formatMonthYearAr(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return `${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** عدد الأيام المتبقية حتى تاريخ (سالب = انقضى) */
export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** "باقي 12 يوم" / "انتهى الموعد" */
export function deadlineLabel(date: Date | string | null | undefined): string {
  const days = daysUntil(date);
  if (days === null) return "غير محدد";
  if (days < 0) return "انتهى الموعد";
  if (days === 0) return "ينتهي اليوم";
  if (days === 1) return "باقي يوم واحد";
  if (days === 2) return "باقي يومان";
  if (days <= 10) return `باقي ${days} أيام`;
  if (days < 30) return `باقي ${days} يوماً`;
  const months = Math.round(days / 30);
  if (months === 1) return "باقي شهر";
  if (months === 2) return "باقي شهران";
  if (months <= 10) return `باقي ${months} أشهر`;
  return `باقي ${months} شهراً`;
}

/** درجة إلحاح الموعد — تتحكّم بلون البادج وشكل الزر */
export type Urgency = "passed" | "urgent" | "soon" | "normal";

export function deadlineUrgency(date: Date | string | null | undefined): Urgency {
  const days = daysUntil(date);
  if (days === null) return "normal";
  if (days < 0) return "passed";
  if (days <= 14) return "urgent";
  if (days <= 45) return "soon";
  return "normal";
}

/** "منذ 5 دقائق" */
export function timeAgoAr(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "الآن";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    if (minutes === 1) return "منذ دقيقة";
    if (minutes === 2) return "منذ دقيقتين";
    if (minutes <= 10) return `منذ ${minutes} دقائق`;
    return `منذ ${minutes} دقيقة`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    if (hours === 1) return "منذ ساعة";
    if (hours === 2) return "منذ ساعتين";
    if (hours <= 10) return `منذ ${hours} ساعات`;
    return `منذ ${hours} ساعة`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    if (days === 1) return "أمس";
    if (days === 2) return "منذ يومين";
    return `منذ ${days} أيام`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    if (weeks === 1) return "منذ أسبوع";
    if (weeks === 2) return "منذ أسبوعين";
    return `منذ ${weeks} أسابيع`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    if (months === 1) return "منذ شهر";
    if (months === 2) return "منذ شهرين";
    return `منذ ${months} أشهر`;
  }
  const years = Math.floor(days / 365);
  return years === 1 ? "منذ سنة" : `منذ ${years} سنوات`;
}

/** 1,248 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** 2.4 MB */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** توليد slug صالح للروابط من نص عربي أو إنجليزي */
export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || `item-${Date.now().toString(36)}`;
}

/** المعدل التراكمي بصيغة موحّدة: 3.88 / 4.00 */
export function formatGpa(value?: number | null, scale?: number | null): string {
  if (value == null) return "—";
  if (scale == null) return String(value);
  if (scale === 100) return `${value}%`;
  return `${value.toFixed(2)} / ${scale.toFixed(2)}`;
}

/** تحويل أي معدل إلى نسبة مئوية للمقارنة بين الأنظمة المختلفة */
export function gpaToPercent(value?: number | null, scale?: number | null): number | null {
  if (value == null || !scale) return null;
  return Math.max(0, Math.min(100, (value / scale) * 100));
}

/** الأحرف الأولى من الاسم للأفاتار النصي */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "؟";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[1][0];
}

/** رقم طلب صياغة السيرة: MNH-CV-8921 */
export function generateOrderNumber(prefix = "MNH-CV"): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${n}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** تحويل رمز الدولة (ISO-3166 alpha-2) إلى علم إيموجي: TR ← 🇹🇷 */
export function countryFlag(code?: string | null): string {
  if (!code || code.length !== 2) return "🌍";
  const upper = code.toUpperCase();
  if (upper === "EU") return "🇪🇺";
  const base = 0x1f1e6;
  return String.fromCodePoint(
    base + (upper.charCodeAt(0) - 65),
    base + (upper.charCodeAt(1) - 65),
  );
}
