<?php

namespace App\Enums;

enum CvOrderStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case InExpertReview = 'in_expert_review';
    case AtsCheck = 'ats_check';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'مسودة',
            self::Submitted => 'تم الاستلام',
            self::InExpertReview => 'قيد المراجعة اليدوية بواسطة الخبير',
            self::AtsCheck => 'الفحص الدقيق لمعايير ATS',
            self::Delivered => 'تم التسليم',
            self::Cancelled => 'ملغي',
        };
    }

    /** الحالات التي تُعدّ الطلب فيها قيد المعالجة */
    public static function active(): array
    {
        return [self::Submitted->value, self::InExpertReview->value, self::AtsCheck->value];
    }

    /** موضع الحالة في التايملاين (null = خارج المسار) */
    public function timelineIndex(): ?int
    {
        return match ($this) {
            self::Submitted => 0,
            self::InExpertReview => 1,
            self::AtsCheck => 2,
            self::Delivered => 3,
            default => null,
        };
    }

    public function next(): ?self
    {
        return match ($this) {
            self::Submitted => self::InExpertReview,
            self::InExpertReview => self::AtsCheck,
            self::AtsCheck => self::Delivered,
            default => null,
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
