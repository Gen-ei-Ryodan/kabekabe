<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordUpdated
{
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Guard PARTNER / VENDOR: dicek khusus untuk rute portal partner & vendor
        if ($request->is('vendor*') || $request->routeIs('partner.*')) {
            $partner = Auth::guard('partner')->user();

            if ($partner && $partner->must_change_password
                && ! $request->routeIs('partner.password.change-initial', 'partner.password.change-initial.update', 'partner.logout')) {
                return redirect()->route('partner.password.change-initial');
            }

            return $next($request);
        }

        // 2. Guard WEB (Member / Admin) - abaikan jika akun vendor
        $user = $request->user();

        if ($user && $user->role !== 'vendor' && $user->must_change_password) {
            if (! $request->routeIs('password.change-initial', 'password.change-initial.update', 'logout')) {
                return redirect()->route('password.change-initial');
            }
        }

        return $next($request);
    }
}
