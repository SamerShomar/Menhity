/**
 * فحص دخان (smoke test) لكل صفحات المنصة.
 *
 * يفتح المتصفح، يسجّل الدخول بالحسابات التجريبية الثلاثة، يزور كل صفحة،
 * ويلتقط لقطة شاشة لكل واحدة، ثم يبلّغ عن أي خطأ جافاسكربت أو استجابة 4xx/5xx.
 *
 * التشغيل: شغّل الخادم أولاً (npm run start) ثم:  npm run smoke
 */

import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const OUT = process.env.SHOTS_DIR ?? "./.smoke-shots";
const BASE = "http://localhost:3000";
const errors = [];

await mkdir(OUT, { recursive: true });

// يسمح بتحديد مسار متصفح مثبّت مسبقاً بدل تنزيل نسخة جديدة
const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);

async function session(email, password, pages, prefix) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await ctx.newPage();

  page.on("pageerror", (e) => errors.push(`[${prefix}] JS error: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`[${prefix}] console: ${m.text().slice(0, 160)}`);
  });
  page.on("response", (r) => {
    if (r.status() >= 500) errors.push(`[${prefix}] ${r.status()} ${r.url()}`);
  });

  if (email) {
    await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await Promise.all([
      page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 20000 }),
      page.click('button[type="submit"]'),
    ]);
    console.log(`✓ logged in as ${email} → ${page.url()}`);
  }

  for (const [name, path] of pages) {
    try {
      const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
      const status = res?.status() ?? 0;
      if (status >= 400) errors.push(`[${prefix}] ${status} on ${path}`);
      await page.screenshot({ path: `${OUT}/${prefix}-${name}.png`, fullPage: true });
      console.log(`  ${status}  ${path}`);
    } catch (e) {
      errors.push(`[${prefix}] failed ${path}: ${e.message}`);
    }
  }

  await ctx.close();
}

// --- زائر ---
await session(null, null, [
  ["home", "/"],
  ["scholarships", "/scholarships"],
  ["scholarships-filtered", "/scholarships?level=MASTER&funding=FULL"],
  ["detail", "/scholarships/turkiye-burslari"],
  ["login", "/login"],
  ["register", "/register"],
  ["forgot", "/forgot-password"],
  ["about", "/about"],
  ["faq", "/faq"],
  ["notfound", "/does-not-exist"],
], "guest");

// --- طالب ---
await session("student@menhity.com", "Menhity@2026", [
  ["dashboard", "/dashboard"],
  ["profile", "/dashboard/profile"],
  ["saved", "/dashboard/saved"],
  ["documents", "/dashboard/documents"],
  ["settings", "/dashboard/settings"],
  ["notifications", "/dashboard/notifications"],
  ["tools", "/tools"],
  ["cv-order", "/tools/cv-builder"],
  ["tool-review", "/tools/profile-review"],
], "student");

// --- مدير ---
await session("admin@menhity.com", "Menhity@2026", [
  ["home", "/admin"],
  ["scholarships", "/admin/scholarships"],
  ["new", "/admin/scholarships/new"],
  ["users", "/admin/users"],
  ["ai-tools", "/admin/ai-tools"],
  ["orders", "/admin/orders"],
  ["notifications", "/admin/notifications"],
  ["reports", "/admin/reports"],
  ["settings", "/admin/settings"],
], "admin");

await browser.close();

console.log("\n" + "=".repeat(50));
if (errors.length === 0) {
  console.log("✅ لا توجد أخطاء");
} else {
  console.log(`⚠️  ${errors.length} مشكلة:`);
  for (const e of [...new Set(errors)]) console.log("  - " + e);
}
