<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\VerifyCodeRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\VerificationCode;
use App\Services\AccessTokenService;
use App\Services\VerificationCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * تأكيد البريد الإلكتروني برمز من ستة أرقام يُرسَل بعد التسجيل.
 *
 * لا تُسلَّم أي جلسة قبل التأكيد، فالحساب غير المؤكَّد لا يستطيع الدخول.
 */
class EmailVerificationController extends Controller
{
    public function __construct(
        private readonly VerificationCodeService $codes,
        private readonly AccessTokenService $tokens,
    ) {}

    /** تأكيد البريد وتسليم توكن الدخول مباشرة */
    public function verify(VerifyCodeRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->value())->first();

        if (! $user) {
            throw $this->codes->invalid();
        }

        // حساب مؤكَّد سابقاً: لا نكشف ذلك برسالة خطأ، بل نوجّهه للدخول
        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'بريدك مؤكَّد بالفعل. سجّل الدخول للمتابعة.',
                'already_verified' => true,
            ], 200);
        }

        $record = $this->codes->verify($user, VerificationCode::TYPE_EMAIL_VERIFY, $request->string('code')->value());

        DB::transaction(function () use ($user, $record): void {
            $user->forceFill(['email_verified_at' => now()])->save();
            $record->update(['used_at' => now()]);
        });

        return response()->json([
            'token' => $this->tokens->issue($request, $user),
            'user' => new UserResource($user->load('profile')),
        ]);
    }

    /** إعادة إرسال رمز التأكيد */
    public function resend(ForgotPasswordRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->value())->first();

        if ($user && ! $user->hasVerifiedEmail()) {
            $this->codes->send($user, VerificationCode::TYPE_EMAIL_VERIFY);
        }

        // رسالة موحّدة سواء وُجد الحساب أم لا
        return response()->json([
            'message' => 'إن كان هذا البريد بانتظار التأكيد فقد أرسلنا إليه رمزاً جديداً.',
        ]);
    }

    /** حالة التأكيد للمستخدم الحالي — تفيد الواجهة في إظهار التنبيهات */
    public function status(Request $request): JsonResponse
    {
        return response()->json([
            'verified' => $request->user()->hasVerifiedEmail(),
            'email' => $request->user()->email,
        ]);
    }
}
