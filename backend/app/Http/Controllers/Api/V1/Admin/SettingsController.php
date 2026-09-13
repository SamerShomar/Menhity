<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiToolRun;
use App\Models\AuditLog;
use App\Models\ContactMessage;
use App\Models\Document;
use App\Models\Notification;
use App\Models\PersonalAccessToken;
use App\Models\Scholarship;
use App\Models\User;
use App\Services\AiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/** معلومات التشغيل وحالة التكاملات وسجل الإجراءات */
class SettingsController extends Controller
{
    public function __construct(private readonly AiService $ai) {}

    public function index(): JsonResponse
    {
        $databaseConnected = rescue(fn () => (bool) DB::connection()->getPdo(), false, false);

        $audit = AuditLog::with('actor:id,name')
            ->latest()
            ->limit(12)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'actor_name' => $log->actor?->name ?? 'النظام',
                'action' => $log->action,
                'entity_type' => $log->entity_type,
                'entity_id' => $log->entity_id,
                'created_at' => $log->created_at,
            ]);

        return response()->json([
            'data' => [
                'site' => config('menhity.site'),
                'integrations' => [
                    [
                        'key' => 'database',
                        'name' => 'قاعدة البيانات (PostgreSQL)',
                        'ok' => $databaseConnected,
                        'note' => $databaseConnected ? 'متصلة وتعمل' : 'تعذّر الاتصال',
                    ],
                    [
                        'key' => 'ai',
                        'name' => 'مزوّد الذكاء الاصطناعي (Claude)',
                        'ok' => $this->ai->isConfigured(),
                        'note' => $this->ai->isConfigured()
                            ? 'المفتاح مضبوط'
                            : 'وضع المحاكاة — المفتاح غير مضبوط',
                    ],
                    [
                        'key' => 'mail',
                        'name' => 'خدمة البريد الإلكتروني',
                        'ok' => config('mail.default') !== 'log',
                        'note' => config('mail.default') === 'log'
                            ? 'غير مربوطة — رموز التحقق تُسجَّل في سجل الخادم'
                            : 'مربوطة عبر '.config('mail.default'),
                    ],
                    [
                        'key' => 'oauth',
                        'name' => 'تسجيل الدخول الخارجي (Google / Apple)',
                        'ok' => false,
                        'note' => 'غير مفعّل — يحتاج بيانات اعتماد OAuth',
                    ],
                ],
                'data_sizes' => [
                    ['label' => 'المستخدمون', 'value' => User::count()],
                    ['label' => 'المنح', 'value' => Scholarship::count()],
                    ['label' => 'المستندات', 'value' => Document::count()],
                    ['label' => 'الإشعارات', 'value' => Notification::count()],
                    ['label' => 'تشغيلات الأدوات', 'value' => AiToolRun::count()],
                ],
                'active_sessions' => PersonalAccessToken::where(
                    fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()),
                )->count(),
                'unread_messages' => ContactMessage::where('is_read', false)->count(),
                'audit_log' => $audit,
            ],
        ]);
    }
}
