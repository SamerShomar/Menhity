<?php

namespace App\Providers;

use App\Mail\Transport\ResendApiTransport;
use App\Models\PersonalAccessToken;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // نستخدم نموذجاً موسّعاً للتوكن يحمل بيانات الجهاز
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);

        // ناقل بريد يعمل عبر HTTPS حيث تحجب الاستضافة منافذ SMTP
        Mail::extend('resend', fn (array $config) => new ResendApiTransport(
            apiKey: (string) ($config['key'] ?? ''),
            timeout: (int) ($config['timeout'] ?? 15),
        ));
    }
}
