<?php

namespace App\Enums;

/** نوع الخدمة اليدوية المطلوبة — يحدّد ما إذا كان الطلب يبدأ من ملف يرفعه الطالب */
enum CvOrderKind: string
{
    case CvBuild = 'cv_build';
    case CvImprove = 'cv_improve';
    case LetterImprove = 'letter_improve';

    public function label(): string
    {
        return match ($this) {
            self::CvBuild => 'كتابة سيرة ذاتية من الصفر',
            self::CvImprove => 'تحسين سيرة ذاتية',
            self::LetterImprove => 'تحسين خطاب دافع',
        };
    }

    public function shortLabel(): string
    {
        return match ($this) {
            self::CvBuild => 'كتابة سيرة',
            self::CvImprove => 'تحسين سيرة',
            self::LetterImprove => 'تحسين خطاب',
        };
    }

    /** الأنواع التي تبدأ من ملف يرفعه الطالب لا من بيانات ملفه الأكاديمي */
    public function requiresSourceFile(): bool
    {
        return $this !== self::CvBuild;
    }
}
