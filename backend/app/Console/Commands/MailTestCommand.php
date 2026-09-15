<?php

namespace App\Console\Commands;

use App\Mail\VerifyEmailCodeMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * تشخيص إعداد البريد من سطر الأوامر.
 *
 * يطبع الإعداد الفعّال ثم يحاول إرسال رسالة حقيقية، ويعرض نص الخطأ
 * كاملاً عند الفشل — أسرع من تتبّع السجلات عند ضبط النشر.
 */
class MailTestCommand extends Command
{
    protected $signature = 'menhity:mail-test {email : البريد المُرسَل إليه}';

    protected $description = 'يفحص إعداد البريد ويرسل رسالة تجريبية';

    public function handle(): int
    {
        $to = $this->argument('email');
        $mailer = config('mail.default');

        $this->newLine();
        $this->line('<comment>الإعداد الفعّال:</comment>');
        $this->table(['المفتاح', 'القيمة'], [
            ['MAIL_MAILER', $mailer],
            ['MAIL_HOST', config('mail.mailers.smtp.host') ?: '—'],
            ['MAIL_PORT', config('mail.mailers.smtp.port') ?: '—'],
            ['MAIL_SCHEME', config('mail.mailers.smtp.scheme') ?: '—'],
            ['MAIL_USERNAME', config('mail.mailers.smtp.username') ?: '—'],
            ['MAIL_PASSWORD', $this->maskedPassword()],
            ['MAIL_FROM_ADDRESS', config('mail.from.address') ?: '—'],
            ['MAIL_FROM_NAME', config('mail.from.name') ?: '—'],
        ]);

        if ($mailer === 'log') {
            $this->warn('MAIL_MAILER=log — الرسالة تُكتب في storage/logs/laravel.log ولا تُرسَل فعلياً.');
        }

        // مستخدم غير مخزَّن: الأمر تشخيصي ولا يلمس قاعدة البيانات
        $user = new User(['name' => 'اختبار منحتي', 'email' => $to]);

        try {
            Mail::to($to)->send(new VerifyEmailCodeMail($user, '123456'));
        } catch (Throwable $e) {
            $this->newLine();
            $this->error('✗ فشل الإرسال');
            $this->newLine();
            $this->line('<comment>'.$e->getMessage().'</comment>');
            $this->newLine();
            $this->line($this->hintFor($e->getMessage()));

            return self::FAILURE;
        }

        $this->newLine();
        $this->info("✓ تم الإرسال إلى {$to}");
        $this->line('إن لم تجد الرسالة خلال دقيقة، راجع مجلد الرسائل غير المرغوب فيها (Spam).');

        return self::SUCCESS;
    }

    /** يُظهر طول كلمة المرور ووجود مسافات دون كشف قيمتها */
    private function maskedPassword(): string
    {
        $password = (string) config('mail.mailers.smtp.password');

        if ($password === '') {
            return '— (غير مضبوطة)';
        }

        $note = str_contains($password, ' ') ? ' ⚠ تحتوي مسافات' : '';

        return str_repeat('•', min(mb_strlen($password), 24)).' ('.mb_strlen($password).' محرفاً)'.$note;
    }

    /** ترجمة أشهر أخطاء SMTP إلى خطوة عملية */
    private function hintFor(string $error): string
    {
        return match (true) {
            str_contains($error, 'scheme is not supported') => 'قيمة MAIL_SCHEME غير مقبولة. استخدم smtp مع المنفذ 587، أو smtps مع المنفذ 465. '
                    .'القيمة tls شائعة الخطأ ولا يقبلها Symfony Mailer.',

            str_contains($error, '535') || stripos($error, 'Username and Password not accepted') !== false => 'اسم المستخدم أو كلمة المرور مرفوضة. مع Gmail: استخدم كلمة مرور تطبيق (App Password) '
                    .'من 16 محرفاً بلا مسافات، لا كلمة مرور حسابك، ويجب تفعيل التحقق بخطوتين أولاً.',

            str_contains($error, '534') => 'Gmail يطلب كلمة مرور تطبيق. فعّل التحقق بخطوتين ثم أنشئ App Password.',

            stripos($error, 'Connection could not be established') !== false || stripos($error, 'timed out') !== false => 'تعذّر الوصول إلى خادم البريد. راجع MAIL_HOST و MAIL_PORT (587 مع MAIL_SCHEME=smtp، أو 465 مع smtps).',

            str_contains($error, '550') || stripos($error, 'not verified') !== false || stripos($error, 'domain') !== false => 'المزوّد يرفض عنوان المُرسِل. يجب أن يكون MAIL_FROM_ADDRESS على نطاق موثَّق لديه '
                    .'(أو نفس بريد الحساب مع Gmail).',

            default => 'انسخ نص الخطأ أعلاه كاملاً عند طلب المساعدة.',
        };
    }
}
