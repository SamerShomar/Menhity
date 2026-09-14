<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CvOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CvOrderResource;
use App\Models\CvOrder;
use App\Services\CvOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class CvOrderController extends Controller
{
    private const RELATIONS = ['timeline', 'atsChecks', 'notes.author', 'expert.expertProfile'];

    public function __construct(
        private readonly CvOrderService $orders,
        private readonly ProfileController $profiles,
    ) {}

    /** الطلب النشط للمستخدم — تستخدمه شاشة الويزرد لتحويله للمتابعة */
    public function active(Request $request): JsonResponse
    {
        $order = $request->user()->cvOrders()
            ->whereIn('status', [...CvOrderStatus::active(), CvOrderStatus::Delivered->value])
            ->latest()
            ->first();

        return response()->json([
            'data' => $order ? (new CvOrderResource($order->load(self::RELATIONS)))->resolve() : null,
        ]);
    }

    /** جاهزية الملف لإرسال الطلب */
    public function readiness(Request $request): JsonResponse
    {
        $profile = $this->profiles->profileFor($request->user());

        return response()->json(['data' => $this->orders->readiness($profile)]);
    }

    public function show(Request $request, CvOrder $cvOrder): CvOrderResource
    {
        abort_unless(
            $cvOrder->user_id === $request->user()->id || $request->user()->isAdminLevel(),
            403,
        );

        return new CvOrderResource($cvOrder->load(self::RELATIONS));
    }

    /** إرسال طلب صياغة جديد */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $existing = $user->cvOrders()->active()->latest()->first();

        if ($existing) {
            return response()->json([
                'message' => 'لديك طلب قيد المعالجة بالفعل.',
                'data' => (new CvOrderResource($existing->load(self::RELATIONS)))->resolve(),
            ], 409);
        }

        try {
            $order = $this->orders->submit($user, $this->profiles->profileFor($user));
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'تم استلام طلبك بنجاح.',
            'data' => (new CvOrderResource($order->load(self::RELATIONS)))->resolve(),
        ], 201);
    }

    /** إرسال ملاحظة خاصة إلى الخبير */
    public function addNote(Request $request, CvOrder $cvOrder): CvOrderResource
    {
        abort_unless($cvOrder->user_id === $request->user()->id, 403);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:3', 'max:2000'],
        ]);

        $cvOrder->notes()->create([
            'author_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        return new CvOrderResource($cvOrder->fresh(self::RELATIONS));
    }
}
