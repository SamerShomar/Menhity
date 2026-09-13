<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyCodeRequest;
use App\Models\User;
use App\Models\VerificationCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * استعادة كلمة المرور برمز من ستة أرقام.
 *
 * خدمة البريد غير مربوطة بعد، لذا يُسجَّل الرمز في سجل الخادم أثناء التطوير.
 */
class PasswordResetController extends Controller
{
    private const CODE_TTL_MINUTES = 15;

    private const MAX_ATTEMPTS = 5;

    /** إرسال رمز الاستعادة */
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->string('email')->value();
        $user = User::where('email', $email)->first();

        if ($user) {
            $this->issueCode($user);
        }

        // الرسالة موحّدة سواء وُجد الحساب أم لا
        return response()->json([
            'message' => 'إذا كان البريد مسجّلاً لدينا فستصلك رسالة تحتوي رمز الاستعادة.',
        ]);
    }

    /** إعادة إرسال الرمز */
    public function resend(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->value())->first();

        if ($user) {
            $this->issueCode($user);
        }

        return response()->json(['message' => 'تم إرسال رمز جديد إلى بريدك الإلكتروني.']);
    }

    /** التحقق من صحة الرمز قبل الانتقال لشاشة كلمة المرور الجديدة */
    public function verify(VerifyCodeRequest $request): JsonResponse
    {
        $this->resolveValidCode(
            $request->string('email')->value(),
            $request->string('code')->value(),
        );

        return response()->json(['message' => 'الرمز صحيح.']);
    }

    /** تعيين كلمة مرور جديدة */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        [$user, $record] = $this->resolveValidCode(
            $request->string('email')->value(),
            $request->string('code')->value(),
        );

        DB::transaction(function () use ($user, $record, $request): void {
            $user->update(['password' => $request->string('password')->value()]);
            $record->update(['used_at' => now()]);

            // إنهاء كل الجلسات بعد تغيير كلمة المرور
            $user->tokens()->delete();
        });

        return response()->json([
            'message' => 'تم تغيير كلمة المرور بنجاح. تم إنهاء جلساتك على جميع الأجهزة.',
        ]);
    }

    /** ينشئ رمزاً جديداً ويلغي الرموز السابقة */
    private function issueCode(User $user): void
    {
        $code = (string) random_int(100000, 999999);

        $user->verificationCodes()
            ->where('type', VerificationCode::TYPE_PASSWORD_RESET)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $user->verificationCodes()->create([
            'type' => VerificationCode::TYPE_PASSWORD_RESET,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
        ]);

        if (app()->isLocal()) {
            Log::info("[منحتي] رمز استعادة كلمة المرور لـ {$user->email}: {$code}");
        }
    }

    /**
     * يتحقق من الرمز ويعيد المستخدم والسجل.
     *
     * @return array{0: User, 1: VerificationCode}
     */
    private function resolveValidCode(string $email, string $code): array
    {
        $invalid = fn (string $message) => ValidationException::withMessages(['code' => $message]);

        $user = User::where('email', $email)->first();

        if (! $user) {
            throw $invalid('الرمز غير صحيح أو منتهي الصلاحية.');
        }

        $record = $user->verificationCodes()
            ->where('type', VerificationCode::TYPE_PASSWORD_RESET)
            ->whereNull('used_at')
            ->latest()
            ->first();

        if (! $record || $record->isExpired()) {
            throw $invalid('انتهت صلاحية الرمز. اطلب رمزاً جديداً.');
        }

        if ($record->attempts >= self::MAX_ATTEMPTS) {
            throw $invalid('تجاوزت عدد المحاولات المسموح بها. اطلب رمزاً جديداً.');
        }

        if (! Hash::check($code, $record->code_hash)) {
            $record->increment('attempts');

            throw $invalid('الرمز غير صحيح. تحقّق من بريدك وحاول مجدداً.');
        }

        return [$user, $record];
    }
}
