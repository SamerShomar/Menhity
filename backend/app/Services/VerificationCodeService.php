<?php

namespace App\Services;

use App\Mail\PasswordResetCodeMail;
use App\Mail\VerifyEmailCodeMail;
use App\Models\User;
use App\Models\VerificationCode;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Throwable;

/**
 * إصدار رموز التحقق من ستة أرقام والتحقق منها.
 *
 * يخدم مسارين: تأكيد البريد بعد التسجيل، واستعادة كلمة المرور.
 * الرمز يُخزَّن مُجزَّأً (hash) فلا يمكن استخراجه من قاعدة البيانات.
 */
class VerificationCodeService
{
    public const TTL_MINUTES = 15;

    public const MAX_ATTEMPTS = 5;

    /**
     * ينشئ رمزاً جديداً، يلغي السابق، ويرسله بالبريد.
     *
     * فشل الإرسال لا يُسقط العملية المستدعية — الحساب يبقى قائماً
     * ويستطيع المستخدم طلب رمز جديد، والخطأ يُسجَّل للمشرف.
     */
    public function send(User $user, string $type): void
    {
        $code = $this->issue($user, $type);

        $mailable = match ($type) {
            VerificationCode::TYPE_EMAIL_VERIFY => new VerifyEmailCodeMail($user, $code),
            VerificationCode::TYPE_PASSWORD_RESET => new PasswordResetCodeMail($user, $code),
            default => null,
        };

        if (! $mailable) {
            return;
        }

        try {
            Mail::to($user->email)->send($mailable);
        } catch (Throwable $e) {
            Log::error('تعذّر إرسال رمز التحقق بالبريد', [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /** ينشئ رمزاً جديداً ويلغي الرموز السابقة من النوع نفسه */
    public function issue(User $user, string $type): string
    {
        $code = (string) random_int(100000, 999999);

        $user->verificationCodes()
            ->where('type', $type)
            ->whereNull('used_at')
            ->update(['used_at' => now()]);

        $user->verificationCodes()->create([
            'type' => $type,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        return $code;
    }

    /**
     * يتحقق من رمز مستخدم بعينه ويعيد سجلّه.
     *
     * @throws ValidationException
     */
    public function verify(User $user, string $type, string $code): VerificationCode
    {
        $record = $user->verificationCodes()
            ->where('type', $type)
            ->whereNull('used_at')
            ->latest()
            ->first();

        if (! $record || $record->isExpired()) {
            throw $this->invalid('انتهت صلاحية الرمز. اطلب رمزاً جديداً.');
        }

        if ($record->attempts >= self::MAX_ATTEMPTS) {
            throw $this->invalid('تجاوزت عدد المحاولات المسموح بها. اطلب رمزاً جديداً.');
        }

        if (! Hash::check($code, $record->code_hash)) {
            $record->increment('attempts');

            throw $this->invalid('الرمز غير صحيح. تحقّق من بريدك وحاول مجدداً.');
        }

        return $record;
    }

    /** رسالة موحّدة حتى لا يُستدلّ منها على وجود الحساب */
    public function invalid(string $message = 'الرمز غير صحيح أو منتهي الصلاحية.'): ValidationException
    {
        return ValidationException::withMessages(['code' => $message]);
    }
}
