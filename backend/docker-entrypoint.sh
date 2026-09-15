#!/bin/sh
# نقطة دخول حاوية منحتي.
# تتحقّق من الإعدادات وتنتظر قاعدة البيانات قبل التشغيل، وتطبع سبب أي فشل
# بوضوح في سجل النشر بدل أن تموت الحاوية صامتة فيظهر «Healthcheck failure».
set -e

fail() {
  echo ""
  echo "════════════════════════════════════════════"
  echo "  ✗ فشل إقلاع منحتي"
  echo "════════════════════════════════════════════"
  echo "  $1"
  echo ""
  echo "  اضبط المتغيّر من تبويب Variables ثم أعد النشر."
  echo "════════════════════════════════════════════"
  exit 1
}

# ── ١) مفتاح التطبيق ──────────────────────────────────────────
# في الحاوية لا يوجد ملف .env (مستبعَد في .dockerignore) فالمصدر هو متغيّرات
# البيئة، لكننا نقبل .env أيضاً حتى يعمل السكربت محلياً بلا تغيير.
if [ -z "$APP_KEY" ] && ! grep -qs '^APP_KEY=base64:' .env; then
  fail "APP_KEY غير مضبوط. ولّده محلياً بـ: php artisan key:generate --show"
fi

echo "→ تهيئة مجلدات التخزين"
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views \
         storage/logs storage/app/public bootstrap/cache
php artisan storage:link --force >/dev/null 2>&1 || true

# ── ٢) انتظار قاعدة البيانات ──────────────────────────────────
# لا نخمّن الإعداد من أسماء المتغيّرات — نحاول الاتصال فعلاً.
# خدمة قاعدة البيانات قد تتأخّر ثوانيَ عن الحاوية عند أول إقلاع.
echo "→ انتظار قاعدة البيانات"
attempt=1
until php artisan db:show --quiet >/dev/null 2>&1; do
  if [ "$attempt" -ge 12 ]; then
    echo ""
    echo "  تفاصيل آخر محاولة اتصال:"
    php artisan db:show 2>&1 | grep -v '^\s*$' | head -12 || true
    fail "تعذّر الاتصال بقاعدة البيانات بعد 12 محاولة (60 ثانية).
  على Railway: أضف خدمة PostgreSQL، ثم اكتب المتغيّر حرفياً هكذا:
      DB_URL=\${{Postgres.DATABASE_URL}}
  وتأكد أن DB_CONNECTION=pgsql"
  fi
  echo "   المحاولة ${attempt}/12 — إعادة المحاولة بعد 5 ثوانٍ"
  attempt=$((attempt + 1))
  sleep 5
done
echo "   ✓ قاعدة البيانات جاهزة"

# ── ٣) الترحيلات ──────────────────────────────────────────────
echo "→ تطبيق الترحيلات"
php artisan migrate --force

# البذر مرة واحدة فقط — بضبط SEED_ON_DEPLOY=true يدوياً عند أول نشر
if [ "$SEED_ON_DEPLOY" = "true" ]; then
  echo "→ زرع البيانات التجريبية"
  php artisan db:seed --force
fi

# ── ٤) التخزين المؤقّت ────────────────────────────────────────
echo "→ تخزين الإعدادات والمسارات مؤقتاً"
php artisan config:cache
php artisan route:cache

echo "→ تشغيل الخادم على المنفذ ${PORT:-8080}"
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
