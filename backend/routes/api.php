<?php

use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| مسارات واجهة منحتي البرمجية — الإصدار الأول
|--------------------------------------------------------------------------
| المصادقة بتوكنات Sanctum: كل توكن يمثّل جهازاً، وهو ما يغذّي
| شاشة "الجلسات والأجهزة النشطة" ويتيح إنهاء أي جهاز على حدة.
*/

Route::prefix('v1')->group(function (): void {

    /* ---------------- عام (بدون مصادقة) ---------------- */

    Route::prefix('auth')->group(function (): void {
        Route::post('register', [AuthController::class, 'register'])
            ->middleware('throttle:10,1')
            ->name('auth.register');

        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:10,1')
            ->name('auth.login');

        Route::post('forgot-password', [PasswordResetController::class, 'forgot'])
            ->middleware('throttle:6,1')
            ->name('auth.forgot');

        Route::post('resend-code', [PasswordResetController::class, 'resend'])
            ->middleware('throttle:6,1')
            ->name('auth.resend');

        Route::post('verify-code', [PasswordResetController::class, 'verify'])
            ->middleware('throttle:10,1')
            ->name('auth.verify');

        Route::post('reset-password', [PasswordResetController::class, 'reset'])
            ->middleware('throttle:6,1')
            ->name('auth.reset');
    });

    /* ---------------- يتطلّب تسجيل دخول ---------------- */

    Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
        Route::get('auth/me', [AuthController::class, 'me'])->name('auth.me');
        Route::post('auth/logout', [AuthController::class, 'logout'])->name('auth.logout');

        Route::get('sessions', [SessionController::class, 'index'])->name('sessions.index');
        Route::delete('sessions/all', [SessionController::class, 'destroyAll'])->name('sessions.destroy-all');
        Route::delete('sessions/{token}', [SessionController::class, 'destroy'])->name('sessions.destroy');
    });
});
