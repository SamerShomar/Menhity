<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** يمنع الحسابات الموقوفة من استخدام الـ API حتى لو كان التوكن صالحاً */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->status === UserStatus::Suspended) {
            $user->tokens()->delete();

            return response()->json([
                'message' => $user->suspension_reason
                    ? "تم إيقاف هذا الحساب. السبب: {$user->suspension_reason}"
                    : 'تم إيقاف هذا الحساب. تواصل مع الدعم لمزيد من التفاصيل.',
            ], 403);
        }

        return $next($request);
    }
}
