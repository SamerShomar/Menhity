#!/bin/sh
set -e

echo "→ تهيئة التخزين"
mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs storage/app/public
php artisan storage:link --force 2>/dev/null || true

echo "→ تطبيق الترحيلات"
php artisan migrate --force

# البذر يتم مرة واحدة فقط، بضبط SEED_ON_DEPLOY=true يدوياً عند أول نشر
if [ "$SEED_ON_DEPLOY" = "true" ]; then
  echo "→ زرع البيانات التجريبية"
  php artisan db:seed --force
fi

echo "→ تخزين الإعدادات والمسارات مؤقتاً"
php artisan config:cache
php artisan route:cache

echo "→ تشغيل الخادم على المنفذ ${PORT:-8080}"
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
