<?php

namespace App\Mail;

use App\Models\User;
use App\Services\VerificationCodeService;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

/** رسالة تأكيد البريد الإلكتروني بعد إنشاء الحساب. */
class VerifyEmailCodeMail extends Mailable
{
    public function __construct(
        public readonly User $user,
        public readonly string $code,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "رمز تأكيد بريدك في منحتي: {$this->code}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification-code',
            with: [
                'name' => $this->user->firstName(),
                'code' => $this->code,
                'heading' => 'أكّد بريدك الإلكتروني',
                'intro' => 'أهلاً بك في منحتي. استخدم الرمز التالي لتأكيد بريدك وتفعيل حسابك.',
                'minutes' => VerificationCodeService::TTL_MINUTES,
                'disclaimer' => 'إن لم تكن أنت من أنشأ هذا الحساب، تجاهل هذه الرسالة ولن يُفعَّل الحساب.',
            ],
        );
    }
}
