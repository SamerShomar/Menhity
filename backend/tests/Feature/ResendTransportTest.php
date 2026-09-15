<?php

namespace Tests\Feature;

use App\Mail\VerifyEmailCodeMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * يغطّي ناقل Resend عبر HTTPS — البديل عن SMTP حين تحجب الاستضافة
 * منافذه الصادرة. بلا أي اتصال بالشبكة.
 */
class ResendTransportTest extends TestCase
{
    use RefreshDatabase;

    private function useResend(): void
    {
        config([
            'mail.default' => 'resend',
            'mail.mailers.resend.key' => 'test-key',
            'mail.from.address' => 'no-reply@menhity.com',
            'mail.from.name' => 'منحتي',
        ]);
    }

    private function send(): void
    {
        $user = new User(['name' => 'سارة علي', 'email' => 'sara@example.com']);

        Mail::to('sara@example.com')->send(new VerifyEmailCodeMail($user, '654321'));
    }

    public function test_it_posts_the_message_to_the_resend_api(): void
    {
        $this->useResend();
        Http::fake(['api.resend.com/*' => Http::response(['id' => 'msg_1'])]);

        $this->send();

        Http::assertSent(function (Request $request) {
            $body = $request->data();

            return $request->url() === 'https://api.resend.com/emails'
                && $request->hasHeader('Authorization', 'Bearer test-key')
                && $body['to'] === ['sara@example.com']
                && str_contains($body['from'], 'no-reply@menhity.com')
                && str_contains($body['subject'], '654321')
                && str_contains($body['html'], '654321');
        });
    }

    public function test_it_sends_a_plain_text_alternative_alongside_the_html(): void
    {
        $this->useResend();
        Http::fake(['api.resend.com/*' => Http::response(['id' => 'msg_1'])]);

        $this->send();

        // غياب النسخة النصية إشارة تصنيف لدى مزوّدي البريد
        Http::assertSent(function (Request $request) {
            $body = $request->data();

            return filled($body['text'] ?? null)
                && str_contains($body['text'], '654321')
                && ! str_contains($body['text'], '<');
        });
    }

    public function test_it_surfaces_an_api_error(): void
    {
        $this->useResend();
        Http::fake(['api.resend.com/*' => Http::response(
            ['message' => 'The from address is not verified', 'name' => 'validation_error'],
            403,
        )]);

        $this->expectExceptionMessageMatches('/from address is not verified/');

        $this->send();
    }

    public function test_the_verification_flow_survives_a_resend_outage(): void
    {
        $this->useResend();
        Http::fake(['api.resend.com/*' => Http::response(['message' => 'down'], 500)]);

        // فشل المزوّد لا يُسقط إنشاء الحساب
        $this->postJson('/api/v1/auth/register', [
            'name' => 'سارة أحمد',
            'email' => 'new@example.com',
            'password' => 'Menhity@2026',
            'password_confirmation' => 'Menhity@2026',
            'accept_terms' => true,
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
    }
}
