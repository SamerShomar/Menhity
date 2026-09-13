import type { Prisma } from "@prisma/client";
import { PAGE_SIZE } from "@/lib/constants";

/** معايير التصفية القادمة من عنوان الصفحة */
export type ScholarshipFilters = {
  q?: string;
  country?: string[];
  level?: string[];
  major?: string[];
  funding?: string[];
  language?: string[];
  sort?: string;
  page?: number;
};

/** قراءة المعايير من searchParams (القيم قد تكون نصاً أو مصفوفة) */
export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ScholarshipFilters {
  const toArray = (v: string | string[] | undefined): string[] | undefined => {
    if (!v) return undefined;
    const list = (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
    return list.length ? list : undefined;
  };

  const page = Number(Array.isArray(params.page) ? params.page[0] : params.page);

  return {
    q: typeof params.q === "string" && params.q.trim() ? params.q.trim() : undefined,
    country: toArray(params.country),
    level: toArray(params.level),
    major: toArray(params.major),
    funding: toArray(params.funding),
    language: toArray(params.language),
    sort: typeof params.sort === "string" ? params.sort : "newest",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

const VALID_LEVELS = ["HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD"];
const VALID_FUNDING = ["FULL", "PARTIAL", "TUITION_ONLY"];
const VALID_LANGUAGE = ["REQUIRED", "NOT_REQUIRED"];

/** بناء شرط where الخاص بـ Prisma */
export function buildWhere(filters: ScholarshipFilters): Prisma.ScholarshipWhereInput {
  const where: Prisma.ScholarshipWhereInput = { status: "PUBLISHED" };
  const and: Prisma.ScholarshipWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { titleAr: { contains: filters.q, mode: "insensitive" } },
        { titleEn: { contains: filters.q, mode: "insensitive" } },
        { provider: { contains: filters.q, mode: "insensitive" } },
        { universityName: { contains: filters.q, mode: "insensitive" } },
        { countryNameAr: { contains: filters.q, mode: "insensitive" } },
        { majors: { some: { name: { contains: filters.q, mode: "insensitive" } } } },
      ],
    });
  }

  if (filters.country?.length) {
    and.push({ countryCode: { in: filters.country.map((c) => c.toUpperCase()) } });
  }

  const levels = filters.level?.filter((l) => VALID_LEVELS.includes(l));
  if (levels?.length) {
    and.push({ levels: { some: { level: { in: levels as never[] } } } });
  }

  if (filters.major?.length) {
    and.push({ majors: { some: { name: { in: filters.major } } } });
  }

  const funding = filters.funding?.filter((f) => VALID_FUNDING.includes(f));
  if (funding?.length) {
    and.push({ fundingType: { in: funding as never[] } });
  }

  const language = filters.language?.filter((l) => VALID_LANGUAGE.includes(l));
  if (language?.length) {
    and.push({ languageRequirement: { in: language as never[] } });
  }

  if (and.length) where.AND = and;
  return where;
}

export function buildOrderBy(sort?: string): Prisma.ScholarshipOrderByWithRelationInput[] {
  switch (sort) {
    case "deadline":
      return [{ deadline: "asc" }];
    case "title":
      return [{ titleAr: "asc" }];
    case "match":
      // الترتيب حسب المطابقة يتم بعد الجلب لأنه يعتمد على ملف المستخدم
      return [{ isFeatured: "desc" }, { createdAt: "desc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

export function paginationArgs(page = 1) {
  return { skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE };
}

/** بناء رابط جديد مع تعديل معيار واحد */
export function buildFilterHref(
  base: string,
  current: ScholarshipFilters,
  change: Partial<Record<keyof ScholarshipFilters, string[] | string | undefined>>,
): string {
  const params = new URLSearchParams();

  const merged: Record<string, string[] | string | undefined> = {
    q: current.q,
    country: current.country,
    level: current.level,
    major: current.major,
    funding: current.funding,
    language: current.language,
    sort: current.sort === "newest" ? undefined : current.sort,
    ...change,
  };

  for (const [key, value] of Object.entries(merged)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(","));
    } else {
      params.set(key, value);
    }
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** إضافة/إزالة قيمة من فلتر متعدد الاختيارات */
export function toggleValue(list: string[] | undefined, value: string): string[] {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  return [...set];
}

export function countActiveFilters(filters: ScholarshipFilters): number {
  return (
    (filters.q ? 1 : 0) +
    (filters.country?.length ?? 0) +
    (filters.level?.length ?? 0) +
    (filters.major?.length ?? 0) +
    (filters.funding?.length ?? 0) +
    (filters.language?.length ?? 0)
  );
}
