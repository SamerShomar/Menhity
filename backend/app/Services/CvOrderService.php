<?php

namespace App\Services;

use App\Enums\CvOrderStatus;
use App\Enums\NotificationType;
use App\Enums\TimelineStatus;
use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\CvOrder;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/** إنشاء طلبات صياغة السيرة الذاتية وتحريك مراحلها */
class CvOrderService
{
    /** مراحل العمل الأربع — مطابقة للتايملاين في الواجهة */
    public const TIMELINE_STEPS = [
        'استلام ومطابقة البيانات الأكاديمية والوثائق المدخلة',
        'المراجعة اليدوية وإعادة صياغة الإنجازات بلغة المنح الأكاديمية',
        'الفحص الدقيق لمعايير ATS والتنسيق الأكاديمي الدولي المعتمد',
        'تسليم النسخة النهائية واعتمادها للتنزيل المباشر',
    ];

    public function __construct(private readonly AtsReportService $ats) {}

    /**
     * شروط جاهزية الملف للإرسال.
     *
     * @return array<int, array{label:string, done:bool, required:bool}>
     */
    public function readiness(StudentProfile $profile): array
    {
        return [
            [
                'label' => 'المعلومات الشخصية والنبذة',
                'done' => filled($profile->full_name_ar) && filled($profile->bio),
                'required' => true,
            ],
            [
                'label' => 'مؤهل دراسي واحد على الأقل',
                'done' => $profile->educations->isNotEmpty(),
                'required' => true,
            ],
            [
                'label' => 'خبرة أو مشروع واحد على الأقل',
                'done' => $profile->experiences->isNotEmpty() || $profile->projects->isNotEmpty(),
                'required' => false,
            ],
            [
                'label' => '3 مهارات على الأقل',
                'done' => $profile->skills->count() >= 3,
                'required' => false,
            ],
            [
                'label' => 'لغة واحدة على الأقل',
                'done' => $profile->languages->isNotEmpty(),
                'required' => false,
            ],
        ];
    }

    /** إنشاء الطلب وإسناده لأقلّ الخبراء انشغالاً */
    public function submit(User $user, StudentProfile $profile): CvOrder
    {
        foreach ($this->readiness($profile) as $requirement) {
            if ($requirement['required'] && ! $requirement['done']) {
                throw new RuntimeException("أكمل «{$requirement['label']}» قبل إرسال الطلب.");
            }
        }

        $expert = User::where('role', UserRole::Expert)
            ->where('status', UserStatus::Active)
            ->withCount('assignedCvOrders')
            ->orderBy('assigned_cv_orders_count')
            ->first();

        $report = $this->ats->build($profile);

        return DB::transaction(function () use ($user, $profile, $expert, $report): CvOrder {
            $order = CvOrder::create([
                'order_number' => CvOrder::generateOrderNumber(),
                'user_id' => $user->id,
                'expert_id' => $expert?->id,
                'status' => CvOrderStatus::InExpertReview,
                'current_step' => 5,
                'ats_score' => $report['score'],
                'submitted_at' => now(),
                'expected_delivery_at' => now()->addHours(config('menhity.cv_order_sla_hours')),
                'data_snapshot' => [
                    'full_name_ar' => $profile->full_name_ar,
                    'full_name_en' => $profile->full_name_en,
                    'bio' => $profile->bio,
                    'educations' => $profile->educations->count(),
                    'experiences' => $profile->experiences->count(),
                    'skills' => $profile->skills->pluck('name')->all(),
                    'languages' => $profile->languages
                        ->map(fn ($l) => "{$l->name} — {$l->proficiency}")
                        ->all(),
                ],
            ]);

            foreach (self::TIMELINE_STEPS as $index => $title) {
                $order->timeline()->create([
                    'title' => $title,
                    'sort_order' => $index,
                    'status' => match (true) {
                        $index === 0 => TimelineStatus::Done,
                        $index === 1 => TimelineStatus::InProgress,
                        default => TimelineStatus::Pending,
                    },
                    'occurred_at' => $index <= 1 ? now() : null,
                ]);
            }

            foreach ($report['checks'] as $index => $check) {
                $order->atsChecks()->create([
                    'label' => $check['label'],
                    'passed' => $check['passed'],
                    'sort_order' => $index,
                ]);
            }

            $user->notifications()->create([
                'type' => NotificationType::OrderUpdate,
                'title' => 'تم استلام طلب صياغة سيرتك الذاتية',
                'body' => "رقم الطلب {$order->order_number}. سيتواصل معك الخبير الأكاديمي خلال 24–48 ساعة عمل.",
                'badge_label' => 'قيد المراجعة',
                'action_label' => 'متابعة الطلب',
                'action_url' => "/tools/cv-builder/orders/{$order->id}",
            ]);

            return $order;
        });
    }

    /** تحريك الطلب إلى مرحلة جديدة ومواءمة التايملاين معها */
    public function advance(CvOrder $order, CvOrderStatus $status): CvOrder
    {
        $target = $status->timelineIndex();

        DB::transaction(function () use ($order, $status, $target): void {
            if ($target !== null) {
                foreach ($order->timeline as $index => $event) {
                    $event->update([
                        'status' => match (true) {
                            $status === CvOrderStatus::Delivered => TimelineStatus::Done,
                            $index < $target => TimelineStatus::Done,
                            $index === $target => TimelineStatus::InProgress,
                            default => TimelineStatus::Pending,
                        },
                        'occurred_at' => $index <= $target ? ($event->occurred_at ?? now()) : null,
                    ]);
                }
            }

            $order->update([
                'status' => $status,
                'delivered_at' => $status === CvOrderStatus::Delivered ? now() : null,
            ]);

            $order->user->notifications()->create([
                'type' => NotificationType::OrderUpdate,
                'title' => $status === CvOrderStatus::Delivered
                    ? 'سيرتك الذاتية جاهزة 🎉'
                    : 'تحديث على طلب صياغة سيرتك الذاتية',
                'body' => "رقم الطلب {$order->order_number}: {$status->label()}.",
                'badge_label' => $status->label(),
                'action_label' => 'متابعة الطلب',
                'action_url' => "/tools/cv-builder/orders/{$order->id}",
            ]);
        });

        return $order->fresh(['timeline', 'atsChecks', 'notes.author', 'expert.expertProfile']);
    }
}
