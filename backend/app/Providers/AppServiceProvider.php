<?php

namespace App\Providers;

use App\Models\PersonalAccessToken;
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
    }
}
