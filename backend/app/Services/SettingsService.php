<?php

namespace App\Services;

use App\Enums\CvOrderKind;
use App\Models\AppSetting;
use Illuminate\Support\Facades\Cache;

/**
 * الإعدادات التي يضبطها المدير من اللوحة: أسعار الخدمات وبيانات التحويل.
 *
 * تُقرأ في كل طلب خدمة تقريباً، فتُحفظ في الذاكرة المؤقتة وتُبطَل عند الكتابة.
 */
class SettingsService
{
    public const PRICING = 'pricing';

    public const PAYMENT = 'payment';

    private const CACHE_TTL = 3600;

    /** خدمة سعرها صفر تبقى مجانية: لا تحويل ولا إشعار ولا انتظار موافقة */
    public const DEFAULT_PRICING = [
        'currency' => 'ILS',
        'cv_build' => 0,
        'cv_improve' => 0,
        'letter_improve' => 0,
        'letter_build' => 0,
    ];

    public const DEFAULT_PAYMENT = [
        'account_holder' => null,
        'bank_name' => null,
        'account_number' => null,
        'iban' => null,
        'instructions' => null,
    ];

    /** @return array<string, mixed> */
    public function pricing(): array
    {
        return $this->get(self::PRICING, self::DEFAULT_PRICING);
    }

    /** @return array<string, mixed> */
    public function payment(): array
    {
        return $this->get(self::PAYMENT, self::DEFAULT_PAYMENT);
    }

    public function currency(): string
    {
        return $this->pricing()['currency'] ?? 'ILS';
    }

    /** سعر خدمة بعينها — صفر يعني مجانية */
    public function priceFor(CvOrderKind $kind): float
    {
        return (float) ($this->pricing()[$kind->value] ?? 0);
    }

    /**
     * بيانات الحساب ناقصة ما لم يُملأ رقم الحساب أو الآيبان.
     * بدونها لا يعرف الطالب إلى أين يحوّل، فالخدمة المدفوعة لا تُطلب.
     */
    public function hasPaymentDetails(): bool
    {
        $payment = $this->payment();

        return filled($payment['account_number'] ?? null) || filled($payment['iban'] ?? null);
    }

    /**
     * @param  array<string, mixed>  $default
     * @return array<string, mixed>
     */
    public function get(string $key, array $default = []): array
    {
        $stored = Cache::remember(
            $this->cacheKey($key),
            self::CACHE_TTL,
            fn () => AppSetting::where('key', $key)->value('value') ?? [],
        );

        // الدمج لا الاستبدال: مفتاح أُضيف بعد آخر حفظ يأخذ قيمته الافتراضية
        return array_merge($default, is_array($stored) ? $stored : []);
    }

    /**
     * @param  array<string, mixed>  $value
     * @return array<string, mixed>
     */
    public function put(string $key, array $value): array
    {
        AppSetting::updateOrCreate(['key' => $key], ['value' => $value]);

        Cache::forget($this->cacheKey($key));

        return $value;
    }

    private function cacheKey(string $key): string
    {
        return "menhity.settings.{$key}";
    }
}
