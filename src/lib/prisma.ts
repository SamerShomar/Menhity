import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * عميل Prisma مُفرد (singleton) — يمنع فتح اتصالات متعددة أثناء
 * إعادة التحميل الساخن في وضع التطوير.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("متغيّر البيئة DATABASE_URL غير معرّف. راجع ملف .env");
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
