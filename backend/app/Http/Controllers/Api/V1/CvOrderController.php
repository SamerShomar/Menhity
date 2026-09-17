<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CvOrderKind;
use App\Enums\CvOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CvOrderResource;
use App\Models\CvOrder;
use App\Services\CvOrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;

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

        $validated = $request->validate([
            'kind' => ['required', Rule::enum(CvOrderKind::class)],
            'file' => [
                'nullable',
                'file',
                'mimes:pdf,doc,docx',
                'max:'.(config('menhity.uploads.max_bytes') / 1024),
            ],
            'note' => ['nullable', 'string', 'max:1000'],
        ], [
            'file.mimes' => 'الملف يجب أن يكون PDF أو Word.',
        ]);

        $kind = CvOrderKind::from($validated['kind']);

        /*
         * المنع لكل خدمة على حدة: طلب تحسين خطاب قائم لا يمنع طلب سيرة،
         * فهما مساران مستقلان يعمل عليهما الفريق بالتوازي.
         */
        $existing = $user->cvOrders()->active()->where('kind', $kind)->latest()->first();

        if ($existing) {
            return response()->json([
                'message' => "لديك طلب «{$kind->label()}» قيد المعالجة بالفعل.",
                'data' => (new CvOrderResource($existing->load(self::RELATIONS)))->resolve(),
            ], 409);
        }

        try {
            $order = $this->orders->submit(
                $user,
                $this->profiles->profileFor($user),
                $kind,
                $request->file('file'),
                $validated['note'] ?? null,
            );
        } catch (RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'message' => 'تم استلام طلبك بنجاح.',
            'data' => (new CvOrderResource($order->load(self::RELATIONS)))->resolve(),
        ], 201);
    }

    /** تحميل الملف النهائي — يُخدَّم من قرص خاص بعد التحقق من الملكية */
    public function downloadFinal(Request $request, CvOrder $cvOrder): StreamedResponse
    {
        abort_unless(
            $cvOrder->user_id === $request->user()->id || $request->user()->isAdminLevel(),
            403,
        );
        abort_unless($cvOrder->final_file_path, 404, 'لم يُسلَّم ملف لهذا الطلب بعد.');

        return Storage::disk('local')->download(
            $cvOrder->final_file_path,
            $cvOrder->final_file_name ?? "منحتي-{$cvOrder->order_number}.pdf",
        );
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
