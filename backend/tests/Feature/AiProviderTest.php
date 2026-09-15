<?php

namespace Tests\Feature;

use App\Models\StudentProfile;
use App\Models\User;
use App\Services\AiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * يغطّي اختيار المزوّد وشكل طلب Gemini ومعالجة استجاباته،
 * بلا أي اتصال بالشبكة.
 */
class AiProviderTest extends TestCase
{
    use RefreshDatabase;

    private function useGemini(): void
    {
        config([
            'menhity.ai.provider' => null,
            'menhity.ai.gemini.api_key' => 'test-key',
            'menhity.ai.gemini.model' => 'gemini-2.5-flash',
            'menhity.ai.anthropic.api_key' => null,
        ]);
    }

    private function profile(): StudentProfile
    {
        return StudentProfile::create([
            'user_id' => User::factory()->create()->id,
            'full_name_ar' => 'سارة علي',
            'headline' => 'طالبة إدارة أعمال',
            'bio' => 'طالبة تسعى لإكمال دراستها العليا في إدارة الأعمال الدولية.',
        ]);
    }

    private function geminiReply(string $text, string $finishReason = 'STOP'): array
    {
        return [
            'candidates' => [[
                'content' => ['parts' => [['text' => $text]], 'role' => 'model'],
                'finishReason' => $finishReason,
            ]],
        ];
    }

    public function test_it_falls_back_to_mock_mode_when_no_provider_key_is_set(): void
    {
        config([
            'menhity.ai.provider' => null,
            'menhity.ai.gemini.api_key' => null,
            'menhity.ai.anthropic.api_key' => null,
        ]);

        Http::fake();

        $result = app(AiService::class)->run('profile-review', $this->profile());

        $this->assertTrue($result['ok']);
        $this->assertTrue($result['mocked']);
        Http::assertNothingSent();
    }

    public function test_it_picks_gemini_automatically_when_only_its_key_is_set(): void
    {
        $this->useGemini();

        $this->assertSame('Google Gemini', app(AiService::class)->providerName());
    }

    public function test_it_sends_a_well_formed_request_to_gemini(): void
    {
        $this->useGemini();
        Http::fake(['*' => Http::response($this->geminiReply('نتيجة التقييم'))]);

        $result = app(AiService::class)->run('profile-review', $this->profile());

        $this->assertTrue($result['ok']);
        $this->assertFalse($result['mocked']);
        $this->assertSame('نتيجة التقييم', $result['output']);

        Http::assertSent(function (Request $request) {
            $body = $request->data();

            return str_contains($request->url(), 'gemini-2.5-flash:generateContent')
                && $request->hasHeader('x-goog-api-key', 'test-key')
                && filled(data_get($body, 'system_instruction.parts.0.text'))
                && str_contains(data_get($body, 'contents.0.parts.0.text'), 'بيانات الملف الأكاديمي')
                && data_get($body, 'generationConfig.maxOutputTokens') === config('menhity.ai.max_tokens');
        });
    }

    public function test_it_joins_multi_part_responses(): void
    {
        $this->useGemini();
        Http::fake(['*' => Http::response([
            'candidates' => [[
                'content' => ['parts' => [['text' => 'الجزء الأول'], ['text' => 'الجزء الثاني']]],
                'finishReason' => 'STOP',
            ]],
        ])]);

        $result = app(AiService::class)->run('profile-review', $this->profile());

        $this->assertSame("الجزء الأول\nالجزء الثاني", $result['output']);
    }

    public function test_it_flags_output_truncated_by_the_token_ceiling(): void
    {
        $this->useGemini();
        Http::fake(['*' => Http::response($this->geminiReply('نص ناقص', 'MAX_TOKENS'))]);

        $result = app(AiService::class)->run('profile-review', $this->profile());

        $this->assertTrue($result['ok']);
        $this->assertStringContainsString('انقطع النص', $result['output']);
    }

    public function test_it_reports_a_blocked_prompt_instead_of_returning_empty_text(): void
    {
        $this->useGemini();
        Http::fake(['*' => Http::response(['promptFeedback' => ['blockReason' => 'SAFETY']])]);

        $result = app(AiService::class)->run('profile-review', $this->profile());

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('رفض المزوّد', $result['error']);
    }

    public function test_it_surfaces_provider_http_errors(): void
    {
        $this->useGemini();
        Http::fake(['*' => Http::response(['error' => ['message' => 'API key not valid']], 400)]);

        $result = app(AiService::class)->run('profile-review', $this->profile());

        $this->assertFalse($result['ok']);
        $this->assertStringContainsString('API key not valid', $result['error']);
    }

    public function test_an_unknown_provider_name_falls_back_to_mock_mode(): void
    {
        config([
            'menhity.ai.provider' => 'openai',
            'menhity.ai.gemini.api_key' => 'test-key',
        ]);

        Http::fake();

        $result = app(AiService::class)->run('profile-review', $this->profile());

        $this->assertTrue($result['mocked']);
        Http::assertNothingSent();
    }
}
