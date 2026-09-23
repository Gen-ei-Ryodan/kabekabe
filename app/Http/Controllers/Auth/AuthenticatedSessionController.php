<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the member login view (kbkb.id/login).
     */
    public function create(): Response
    {
        return $this->renderLogin('member');
    }

    /**
     * Display the partner login view (kbkb.id/partner).
     */
    public function createPartner(): Response
    {
        return $this->renderLogin('partner');
    }

    /**
     * Display the admin login view (kbkb.id/admin).
     */
    public function createAdmin(): Response
    {
        return $this->renderLogin('admin');
    }

    private function renderLogin(string $portal): Response
    {
        $guard = $portal === 'partner' ? 'partner' : 'web';
        $expectedRole = $this->expectedRole($portal);
        $user = Auth::guard($guard)->user();

        if ($user && $user->role === $expectedRole) {
            return redirect()->intended(route($user->homeRoute()));
        }

        return Inertia::render('Auth/Login', [
            'portal' => $portal,
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming member authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        return $this->attemptLogin($request, 'web', 'member');
    }

    /**
     * Handle an incoming partner authentication request (guard: partner).
     */
    public function storePartner(LoginRequest $request): RedirectResponse
    {
        return $this->attemptLogin($request, 'partner', 'partner');
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        return $this->attemptLogin($request, 'web', 'admin');
    }

    private function attemptLogin(LoginRequest $request, string $guard, string $portal): RedirectResponse
    {
        $request->authenticate($guard);

        $user = Auth::guard($guard)->user();

        if ($user->role !== $this->expectedRole($portal)) {
            Auth::guard($guard)->logout();

            throw ValidationException::withMessages([
                'email' => 'Akun ini tidak sesuai dengan halaman login tersebut. Silakan gunakan halaman login yang benar.',
            ]);
        }

        if ($user->approval_status === User::APPROVAL_PENDING) {
            Auth::guard($guard)->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Pendaftaran akun Anda masih menunggu persetujuan (approval) oleh Admin.',
            ]);
        }

        if ($user->approval_status === User::APPROVAL_REJECTED) {
            Auth::guard($guard)->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return back()->withErrors([
                'email' => 'Pendaftaran akun Anda telah ditolak oleh Admin.',
            ]);
        }

        $request->session()->regenerate();

        if ($user->must_change_password) {
            return redirect()->route($guard === 'partner' ? 'partner.password.change-initial' : 'password.change-initial');
        }

        return redirect()->intended(route($user->homeRoute()));
    }

    private function expectedRole(string $portal): string
    {
        return match ($portal) {
            'admin' => User::ROLE_ADMIN,
            'partner' => User::ROLE_VENDOR,
            default => User::ROLE_MEMBER,
        };
    }

    /**
     * Destroy web-guard session (member/admin) tanpa membunuh sesi partner.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        // regenerate (bukan invalidate) agar login partner di guard 'partner' tetap hidup.
        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Destroy partner-guard session tanpa membunuh sesi member/admin.
     */
    public function destroyPartner(Request $request): RedirectResponse
    {
        Auth::guard('partner')->logout();

        $request->session()->regenerate();
        $request->session()->regenerateToken();

        return redirect()->route('partner.login');
    }
}
