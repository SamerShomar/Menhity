<?php

namespace Tests\Feature;

use App\Enums\CvOrderKind;
use App\Enums\CvOrderStatus;
use App\Enums\PaymentStatus;
use App\Models\User;
use App\Services\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** الخدمة المدفوعة: إشعار التحويل من الطالب، وتأكيده من الإدارة */
class CvOrderPaymentTest extends TestCase
{
    use RefreshDatabase;

    private function priceTheService(float $price = 50): void
    {
        $settings = app(SettingsService::class);

        $settings->put(SettingsService::PRICING, [
            'currency' => 'ILS',
            'cv_build' => $price,
            'cv_improve' => $price,
            'letter_improve' => $price,
        ]);

        $settings->put(SettingsService::PAYMENT, [
            'account_holder' => 'منصة منحتي',
            'bank_name' => 'بنك فلسطين',
            'account_number' => '123456789',
            'iban' => 'PS00PALS000000000123456789',
            'instructions' => 'اكتب رقم الطلب في خانة البيان.',
        ]);
    }

    private function receipt(): UploadedFile
    {
        return UploadedFile::fake()->image('receipt.jpg');
    }

    private function sourceFile(): UploadedFile
    {
        return UploadedFile::fake()->create('cv.pdf', 200, 'application/pdf');
    }

    public function test_students_read_the_price_and_the_account_to_transfer_to(): void
    {
        $this->priceTheService(75);

        $response = $this->actingAs(User::factory()->withProfile()->create())
            ->getJson('/api/v1/cv-orders/payment-info')
            ->assertOk();

        $this->assertTrue($response->json('data.configured'));
        $this->assertSame('123456789', $response->json('data.account.account_number'));
        $this->assertSame('PS00PALS000000000123456789', $response->json('data.account.iban'));
        $this->assertSame(75, $response->json('data.services.1.price'));
    }

    public function test_a_paid_order_is_refused_without_a_transfer_receipt(): void
    {
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
        ])->assertStatus(422);

        $this->assertSame(0, $user->cvOrders()->count());
    }

    public function test_a_paid_order_waits_for_the_admin_to_confirm_the_transfer(): void
    {
        Storage::fake('local');
        $this->priceTheService(60);
        $user = User::factory()->withProfile()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
            'payment_note' => 'حوّلت عبر تطبيق البنك.',
        ])->assertCreated();

        $this->assertSame(CvOrderStatus::PendingApproval->value, $response->json('data.status'));
        $this->assertSame(PaymentStatus::AwaitingReview->value, $response->json('data.payment_status'));
        $this->assertTrue($response->json('data.payment_blocks_work'));

        // السعر يُجمَّد على الطلب لحظة إرساله
        $this->assertEquals(60, $response->json('data.price_amount'));

        $order = $user->cvOrders()->first();
        Storage::disk('local')->assertExists($order->receipt_file_path);
    }

    public function test_a_later_price_change_does_not_rewrite_an_existing_order(): void
    {
        Storage::fake('local');
        $this->priceTheService(60);
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $this->priceTheService(200);

        $this->assertSame('60.00', $user->cvOrders()->first()->price_amount);
    }

    public function test_the_team_cannot_deliver_before_the_transfer_is_confirmed(): void
    {
        Storage::fake('local');
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $order = $user->cvOrders()->first();

        $this->actingAs(User::factory()->admin()->create())
            ->postJson("/api/v1/admin/orders/{$order->id}/deliver", [
                'file' => UploadedFile::fake()->create('final.pdf', 120, 'application/pdf'),
            ])
            ->assertStatus(422);

        $this->assertNull($order->fresh()->final_file_path);
    }

    public function test_accepting_the_receipt_starts_the_work(): void
    {
        Storage::fake('local');
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();
        $admin = User::factory()->admin()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $order = $user->cvOrders()->first();

        $this->actingAs($admin)
            ->postJson("/api/v1/admin/orders/{$order->id}/payment", ['decision' => 'accept'])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatus::Accepted->value)
            ->assertJsonPath('data.status', CvOrderStatus::InExpertReview->value);

        $this->assertSame($admin->id, $order->fresh()->payment_reviewed_by);
    }

    public function test_rejecting_the_receipt_keeps_the_order_open_for_a_new_one(): void
    {
        Storage::fake('local');
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $order = $user->cvOrders()->first();

        $this->actingAs(User::factory()->admin()->create())
            ->postJson("/api/v1/admin/orders/{$order->id}/payment", [
                'decision' => 'reject',
                'reason' => 'الإشعار غير واضح، أعد رفعه.',
            ])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatus::Rejected->value);

        // الطلب يبقى قائماً ليرفع الطالب إشعاراً بديلاً
        $this->actingAs($user)
            ->postJson("/api/v1/cv-orders/{$order->id}/receipt", ['receipt' => $this->receipt()])
            ->assertOk()
            ->assertJsonPath('data.payment_status', PaymentStatus::AwaitingReview->value);

        $this->assertNull($order->fresh()->payment_rejection_reason);
    }

    public function test_rejection_requires_a_reason(): void
    {
        Storage::fake('local');
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $this->actingAs(User::factory()->admin()->create())
            ->postJson("/api/v1/admin/orders/{$user->cvOrders()->first()->id}/payment", [
                'decision' => 'reject',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('reason');
    }

    public function test_a_free_service_skips_the_transfer_entirely(): void
    {
        Storage::fake('local');
        $user = User::factory()->withProfile()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
        ])->assertCreated();

        $this->assertFalse($response->json('data.is_paid'));
        $this->assertSame(PaymentStatus::NotRequired->value, $response->json('data.payment_status'));
        $this->assertSame(CvOrderStatus::InExpertReview->value, $response->json('data.status'));
    }

    public function test_a_paid_service_is_refused_while_the_account_details_are_missing(): void
    {
        app(SettingsService::class)->put(SettingsService::PRICING, [
            'currency' => 'ILS',
            'cv_build' => 0,
            'cv_improve' => 40,
            'letter_improve' => 0,
        ]);

        $this->actingAs(User::factory()->withProfile()->create())
            ->postJson('/api/v1/cv-orders', [
                'kind' => 'cv_improve',
                'file' => $this->sourceFile(),
                'receipt' => $this->receipt(),
            ])
            ->assertStatus(422);
    }

    public function test_only_the_owner_can_replace_a_receipt(): void
    {
        Storage::fake('local');
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $this->actingAs(User::factory()->withProfile()->create())
            ->postJson("/api/v1/cv-orders/{$user->cvOrders()->first()->id}/receipt", [
                'receipt' => $this->receipt(),
            ])
            ->assertForbidden();
    }

    public function test_an_admin_sets_prices_and_the_account_from_the_dashboard(): void
    {
        $this->actingAs(User::factory()->admin()->create())
            ->putJson('/api/v1/admin/settings/payment', [
                'currency' => 'ILS',
                'prices' => ['cv_build' => 80, 'cv_improve' => 50, 'letter_improve' => 35],
                'account_holder' => 'منصة منحتي',
                'bank_name' => 'بنك فلسطين',
                'account_number' => '987654321',
                'iban' => 'PS00PALS000000000987654321',
                'instructions' => 'اكتب رقم الطلب في خانة البيان.',
            ])
            ->assertOk();

        $settings = app(SettingsService::class);

        $this->assertSame(50.0, $settings->priceFor(CvOrderKind::CvImprove));
        $this->assertSame('987654321', $settings->payment()['account_number']);
    }

    public function test_an_admin_fetches_the_receipt_to_look_at_it(): void
    {
        Storage::fake('local');
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $order = $user->cvOrders()->first();

        $this->actingAs(User::factory()->admin()->create())
            ->get("/api/v1/admin/orders/{$order->id}/receipt")
            ->assertOk();
    }

    /**
     * قرص الحاوية مؤقّت: إعادة النشر تمحو المرفوعات ويبقى سجلّها في
     * قاعدة البيانات. بلا فحص الوجود يرمي Flysystem استثناءً فيصل المدير
     * خطأ خادم غامض بدل سببٍ يفهمه.
     */
    public function test_a_receipt_wiped_off_disk_answers_with_a_clear_404(): void
    {
        Storage::fake('local');
        $this->priceTheService();
        $user = User::factory()->withProfile()->create();

        $this->actingAs($user)->postJson('/api/v1/cv-orders', [
            'kind' => 'cv_improve',
            'file' => $this->sourceFile(),
            'receipt' => $this->receipt(),
        ])->assertCreated();

        $order = $user->cvOrders()->first();

        Storage::disk('local')->delete($order->receipt_file_path);
        Storage::disk('local')->delete($order->source_file_path);

        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)
            ->getJson("/api/v1/admin/orders/{$order->id}/receipt")
            ->assertNotFound()
            ->assertJsonPath('message', 'الملف لم يعد موجوداً على الخادم. اطلب من الطالب رفعه مرة أخرى.');

        $this->actingAs($admin)
            ->getJson("/api/v1/admin/orders/{$order->id}/source")
            ->assertNotFound();
    }

    public function test_students_cannot_set_prices(): void
    {
        $this->actingAs(User::factory()->withProfile()->create())
            ->putJson('/api/v1/admin/settings/payment', [
                'currency' => 'ILS',
                'prices' => ['cv_build' => 0, 'cv_improve' => 0, 'letter_improve' => 0],
            ])
            ->assertForbidden();
    }
}
