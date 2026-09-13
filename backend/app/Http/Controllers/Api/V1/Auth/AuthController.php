<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\NotificationType;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\DeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private readonly DeviceService $devices) {}

    /** إنشاء حساب جديد وإرجاع توكن الوصول */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = DB::transaction(function () use ($request): User {
            $user = User::create([
                'name' => $request->string('name')->trim()->value(),
                'email' => $request->string('email')->value(),
                'password' => $request->string('password')->value(),
                'accepted_terms_at' => now(),
            ]);

            $user->profile()->create(['full_name_ar' => $user->name]);

            $user->notifications()->create([
                'type' => NotificationType::System,
                'title' => 'أهلاً بك في منحتي 👋',
                'body' => 'أكمل ملفك الأكاديمي لنبدأ باقتراح المنح الأنسب لك.',
                'badge_label' => 'جديد',
                'action_label' => 'إكمال الملف',
                'action_url' => '/dashboard/profile',
            ]);

            return $user;
        });

        return $this->respondWithToken($request, $user, 201);
    }

    /** تسجيل الدخول */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->string('email')->value())->first();

        // رسالة موحّدة حتى لا نكشف وجود الحساب من عدمه
        if (! $user?->password || ! Hash::check($request->string('password')->value(), $user->password)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        if ($user->status === UserStatus::Suspended) {
            throw ValidationException::withMessages([
                'email' => $user->suspension_reason
                    ? "تم إيقاف هذا الحساب. السبب: {$user->suspension_reason}"
                    : 'تم إيقاف هذا الحساب. تواصل مع الدعم لمزيد من التفاصيل.',
            ]);
        }

        // الحساب المعطّل مؤقتاً يُعاد تفعيله بمجرّد نجاح الدخول
        if ($user->status === UserStatus::Inactive) {
            $user->update(['status' => UserStatus::Active]);
        }

        return $this->respondWithToken($request, $user);
    }

    /** المستخدم الحالي */
    public function me(Request $request): UserResource
    {
        return new UserResource($request->user()->load('profile'));
    }

    /** تسجيل الخروج من الجهاز الحالي فقط */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'تم تسجيل الخروج بنجاح.']);
    }

    /** ينشئ توكناً يحمل بيانات الجهاز ويعيده مع بيانات المستخدم */
    private function respondWithToken(Request $request, User $user, int $status = 200): JsonResponse
    {
        $device = $this->devices->fromRequest($request);

        $token = $user->createToken(
            name: $device['browser'].' · '.$device['os'],
            expiresAt: now()->addDays(30),
        );

        $token->accessToken->forceFill($device)->save();

        $user->update(['last_login_at' => now()]);

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => new UserResource($user->load('profile')),
        ], $status);
    }
}
