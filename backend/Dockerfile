# صورة نشر خادم منحتي
# القاعدة رسمية من Debian، والامتدادات تُثبَّت بأداة install-php-extensions
# التي تتكفّل بمكتبات النظام المطلوبة لكل امتداد — أوثق من التثبيت اليدوي.
FROM php:8.4-cli

ADD https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions /usr/local/bin/
RUN chmod +x /usr/local/bin/install-php-extensions \
    && install-php-extensions pdo_pgsql pdo_sqlite intl bcmath zip opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# طبقة الاعتماديات منفصلة حتى لا تُعاد مع كل تعديل على الكود
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY . .
RUN composer dump-autoload --optimize --no-dev

# إعدادات OPcache للإنتاج
RUN { \
      echo 'opcache.enable=1'; \
      echo 'opcache.validate_timestamps=0'; \
      echo 'opcache.memory_consumption=128'; \
      echo 'opcache.max_accelerated_files=10000'; \
    } > /usr/local/etc/php/conf.d/opcache.ini

RUN chmod +x docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["./docker-entrypoint.sh"]
