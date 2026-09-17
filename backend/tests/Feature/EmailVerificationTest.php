<?php

namespace Tests\Feature;

use App\Mail\PasswordResetCodeMail;
use App\Mail\VerifyEmailCodeMail;
use App\Models\User;
use App\Models\VerificationCode;
use App\Services\VerificationCodeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * يغطّي دورة تأكيد البريد كاملة: الإرسال عند التسجيل، حجب الدخول
 * قبل التأكيد، التحقق من الرمز، وحدود المحاولات والصلاحية.
 */
class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    private const PASSWORD = 'Menhity@2026';

    /** @return array{0: User, 1: string} المستخدم والرمز الصريح */
    private function unverifiedUserWithCode(): array
    {
        $user = User::factory()->unverified()->create(['password' => self::PASSWORD]);
        $code = app(VerificationCodeService::class)->issue($user, VerificationCode::TYPE_EMAIL_VERIFY);

        return [$user, $code];
    }

    public function test_registration_sends_a_verification_email(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/register', [
            'name' => 'سارة أحمد',
            'email' => 'sara@example.com',
            'password' => self::PASSWORD,
            'password_confirmation' => self::PASSWORD,
            'accept_terms' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('code_sent', true);

        Mail::assertSent(
            VerifyEmailCodeMail::class,
            fn (VerifyEmailCodeMail $mail) => $mail->hasTo('sara@example.com')
                && preg_match('/^\d{6}$/', $mail->code) === 1,
        );

        $user = User::where('email', 'sara@example.com')->first();

        $this->assertSame(
            1,
            $user->verificationCodes()->where('type', VerificationCode::TYPE_EMAIL_VERIFY)->count(),
        );
    }

    public function test_the_stored_code_is_hashed_and_not_readable(): void
    {
        [$user, $code] = $this->unverifiedUserWithCode();

        $record = $user->verificationCodes()->latest()->first();

        $this->assertNotSame($code, $record->code_hash);
        $this->assertStringNotContainsString($code, $record->code_hash);
    }

    public function test_an_unverified_user_cannot_log_in_and_gets_a_fresh_code(): void
    {
        Mail::fake();
        [$user] = $this->unverifiedUserWithCode();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => self::PASSWORD,
        ])
            ->assertStatus(409)
            ->assertJsonPath('requires_verification', true)
            ->assertJsonPath('email', $user->email)
            ->assertJsonMissingPath('token');

        Mail::assertSent(VerifyEmailCodeMail::class);
    }

    public function test_a_verified_user_logs_in_normally(): void
    {
        Mail::fake();
        $user = User::factory()->create(['password' => self::PASSWORD]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => self::PASSWORD,
        ])->assertOk()->assertJsonStructure(['token', 'user']);

        Mail::assertNothingSent();
    }

    public function test_the_correct_code_verifies_the_email_and_returns_a_token(): void
    {
        [$user, $code] = $this->unverifiedUserWithCode();

        $this->postJson('/api/v1/auth/verify-email', [
            'email' => $user->email,
            'code' => $code,
        ])->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'email']]);

        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->assertNotNull($user->verificationCodes()->latest()->first()->used_at);
    }

    public function test_a_used_code_cannot_be_replayed(): void
    {
        [$user, $code] = $this->unverifiedUserWithCode();

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => $code])->assertOk();

        // الحساب صار مؤكَّداً، فلا يُسلَّم توكن ثانٍ من الرمز نفسه
        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => $code])
            ->assertOk()
            ->assertJsonPath('already_verified', true)
            ->assertJsonMissingPath('token');
    }

    public function test_a_wrong_code_is_rejected_and_counts_an_attempt(): void
    {
        [$user, $code] = $this->unverifiedUserWithCode();
        $wrong = $code === '000000' ? '111111' : '000000';

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => $wrong])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->assertSame(1, $user->verificationCodes()->latest()->first()->attempts);
        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_the_code_is_locked_after_too_many_wrong_attempts(): void
    {
        [$user, $code] = $this->unverifiedUserWithCode();
        $user->verificationCodes()->latest()->first()->update([
            'attempts' => VerificationCodeService::MAX_ATTEMPTS,
        ]);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => $code])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->assertNull($user->fresh()->email_verified_at);
    }

    public function test_an_expired_code_is_rejected(): void
    {
        [$user, $code] = $this->unverifiedUserWithCode();
        $user->verificationCodes()->latest()->first()->update(['expires_at' => now()->subMinute()]);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => $code])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_resending_issues_a_new_code_and_cancels_the_previous_one(): void
    {
        Mail::fake();
        [$user, $first] = $this->unverifiedUserWithCode();

        $this->postJson('/api/v1/auth/resend-verification', ['email' => $user->email])->assertOk();

        Mail::assertSent(VerifyEmailCodeMail::class);

        // الرمز القديم بطل مفعوله فوراً
        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => $first])
            ->assertUnprocessable();
    }

    public function test_resending_for_an_unknown_email_stays_silent(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/auth/resend-verification', ['email' => 'nobody@example.com'])
            ->assertOk()
            ->assertJsonStructure(['message']);

        Mail::assertNothingSent();
    }

    public function test_verifying_an_unknown_email_reveals_nothing(): void
    {
        $this->postJson('/api/v1/auth/verify-email', ['email' => 'nobody@example.com', 'code' => '123456'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_password_reset_sends_a_real_email(): void
    {
        Mail::fake();
        $user = User::factory()->create();

        $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])->assertOk();

        Mail::assertSent(
            PasswordResetCodeMail::class,
            fn (PasswordResetCodeMail $mail) => $mail->hasTo($user->email),
        );
    }

    public function test_resetting_the_password_also_marks_the_email_verified(): void
    {
        [$user, $_] = $this->unverifiedUserWithCode();
        $code = app(VerificationCodeService::class)->issue($user, VerificationCode::TYPE_PASSWORD_RESET);

        $this->postJson('/api/v1/auth/reset-password', [
            'email' => $user->email,
            'code' => $code,
            'password' => 'NewMenhity@2026',
            'password_confirmation' => 'NewMenhity@2026',
        ])->assertOk();

        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_a_failing_mailer_does_not_break_registration(): void
    {
        Mail::shouldReceive('to')->andThrow(new \RuntimeException('SMTP down'));

        $this->postJson('/api/v1/auth/register', [
            'name' => 'سارة أحمد',
            'email' => 'sara@example.com',
            'password' => self::PASSWORD,
            'password_confirmation' => self::PASSWORD,
            'accept_terms' => true,
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'sara@example.com']);
    }
}
