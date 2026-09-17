<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\CvOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CvOrderResource;
use App\Models\CvOrder;
use App\Services\AuditService;
use App\Services\CvOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly CvOrderService $orders,
        private readonly AuditService $audit,
    ) {}

    public function index(): JsonResponse
    {
        $orders = CvOrder::with(['user:id,name,email', 'expert:id,name'])
            ->where('status', '!=', CvOrderStatus::Draft)
            ->latest()
            ->limit(40)
            ->get();

        return response()->json([
            'data' => $orders->map(fn (CvOrder $order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'kind' => $order->kind->value,
                'kind_label' => $order->kind->label(),
                'has_source_file' => filled($order->source_file_path),
                'source_file_name' => $order->source_file_name,
                'has_final_file' => filled($order->final_file_path),
                'final_file_name' => $order->final_file_name,
                'request_note' => $order->request_note,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'next_status' => $order->status->next()?->value,
                'next_status_label' => $order->status->next()?->label(),
                'ats_score' => $order->ats_score,
                'student_name' => $order->user->name,
                'student_email' => $order->user->email,
                'expert_name' => $order->expert?->name,
                'updated_at' => $order->updated_at,
            ])->all(),
            'meta' => [
                'total' => CvOrder::where('status', '!=', CvOrderStatus::Draft)->count(),
                'in_progress' => CvOrder::active()->count(),
                'delivered' => CvOrder::where('status', CvOrderStatus::Delivered)->count(),
                'unassigned' => CvOrder::whereNull('expert_id')
                    ->where('status', '!=', CvOrderStatus::Draft)
                    ->count(),
            ],
        ]);
    }

    /** تحميل الملف الذي رفعه الطالب ليعمل عليه الفريق */
    public function downloadSource(CvOrder $cvOrder): StreamedResponse
    {
        abort_unless($cvOrder->source_file_path, 404, 'لم يرفق الطالب ملفاً مع هذا الطلب.');

        return Storage::disk('local')->download(
            $cvOrder->source_file_path,
            $cvOrder->source_file_name ?? "طلب-{$cvOrder->order_number}",
        );
    }

    /** تسليم الملف النهائي بعد إعداده يدوياً */
    public function deliver(Request $request, CvOrder $cvOrder): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx',
                'max:'.(config('menhity.uploads.max_bytes') / 1024),
            ],
        ], [
            'file.required' => 'أرفق الملف النهائي لتسليمه.',
            'file.mimes' => 'الملف يجب أن يكون PDF أو Word.',
        ]);

        $order = $this->orders->deliver($cvOrder, $request->file('file'));

        $this->audit->log($request->user(), 'cv_order.deliver', 'CvOrder', $order->id, [
            'file' => $order->final_file_name,
        ]);

        return response()->json([
            'message' => 'تم تسليم الملف وإشعار الطالب.',
            'data' => (new CvOrderResource($order))->resolve(),
        ]);
    }

    /** تحريك الطلب إلى المرحلة التالية */
    public function advance(Request $request, CvOrder $cvOrder): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::enum(CvOrderStatus::class)],
        ]);

        $status = CvOrderStatus::from($validated['status']);
        $order = $this->orders->advance($cvOrder, $status);

        $this->audit->log($request->user(), 'cv_order.status', 'CvOrder', $order->id, [
            'status' => $status->value,
        ]);

        return response()->json([
            'message' => "تم تحديث الطلب إلى: {$status->label()}",
            'data' => (new CvOrderResource($order))->resolve(),
        ]);
    }
}
