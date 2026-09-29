<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Satu akun hanya boleh aktif di 1 device.
 * Login di device baru mengubah users.login_token; device lama yang
 * membawa token berbeda langsung di-logout (per guard, sesi partner
 * di browser yang sama tidak ikut terbunuh).
 */
class EnsureSingleDeviceLogin
{
    private const SESSION_PREFIX = 'login_token.';

    public static function sessionKey(string $guard): string
    {
        return self::SESSION_PREFIX.$guard;
    }

    public static function issueToken(User $user, string $guard, Request $request): string
    {
        $token = Str::random(40);

        $user->forceFill([
            'login_token' => $token,
            'last_login_at' => now(),
        ])->save();

        $request->session()->put(self::sessionKey($guard), $token);

        return $token;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $kickedPortal = null;

        foreach (['web', 'partner'] as $guard) {
            $user = Auth::guard($guard)->user();

            if (! $user) {
                continue;
            }

            $sessionToken = $request->session()->get(self::sessionKey($guard));

            // Sesi lama (sebelum fitur ini) atau login tanpa token: jangan tendang.
            if ($sessionToken === null || $user->login_token === null) {
                continue;
            }

            if (hash_equals((string) $user->login_token, (string) $sessionToken)) {
                continue;
            }

            $kickedPortal ??= $this->loginRoute($user->role);

            Auth::guard($guard)->logout();
        }

        if ($kickedPortal !== null) {
            return redirect()->route($kickedPortal)->with('status', 'Sesi Anda di device lama diakhiri karena akun ini login di perangkat lain.');
        }

        return $next($request);
    }

    private function loginRoute(string $role): string
    {
        return match ($role) {
            User::ROLE_ADMIN => 'admin.login',
            User::ROLE_VENDOR => 'partner.login',
            default => 'login',
        };
    }
}
