<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\InitialPasswordController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PartnerLinkOtpController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordOtpController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

// ---------- LOGIN PORTALS ----------
// Di luar middleware `guest` supaya 1 window bisa membuka /login (member),
// /partner, dan /admin tanpa saling menendang. Redirect jika sudah login
// ditangani di AuthenticatedSessionController::renderLogin().
Route::get('login', [AuthenticatedSessionController::class, 'create'])
    ->name('login');

Route::post('login', [AuthenticatedSessionController::class, 'store'])
    ->middleware('throttle:6,1,login');

Route::get('partner', [AuthenticatedSessionController::class, 'createPartner'])
    ->name('partner.login');

Route::post('partner', [AuthenticatedSessionController::class, 'storePartner'])
    ->middleware('throttle:6,1,partner-login')
    ->name('partner.login.store');

Route::get('admin', [AuthenticatedSessionController::class, 'createAdmin'])
    ->name('admin.login');

Route::post('admin', [AuthenticatedSessionController::class, 'storeAdmin'])
    ->middleware('throttle:6,1,admin-login')
    ->name('admin.login.store');

// Lupa password: minta kode OTP ke email.
// Di luar middleware `guest` agar user yang sedang login di salah satu guard (misal member)
// tetap bisa melakukan forgot password untuk akun portal lain (misal partner) tanpa di-redirect.
Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
    ->name('password.request');

Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
    ->middleware('throttle:5,1,password-email')
    ->name('password.email');

// Verifikasi kode OTP.
Route::get('forgot-password/verify-otp', [PasswordOtpController::class, 'create'])
    ->name('password.otp');

Route::post('forgot-password/verify-otp', [PasswordOtpController::class, 'store'])
    ->middleware('throttle:10,1,password-otp-verify')
    ->name('password.otp.verify');

Route::post('forgot-password/resend-otp', [PasswordOtpController::class, 'resend'])
    ->middleware('throttle:3,1,password-otp-resend')
    ->name('password.otp.resend');

// Reset password baru setelah OTP terverifikasi.
Route::get('reset-password', [NewPasswordController::class, 'create'])
    ->name('password.reset');

Route::post('reset-password', [NewPasswordController::class, 'store'])
    ->middleware('throttle:5,1,password-reset')
    ->name('password.store');

Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])
        ->name('register');

    Route::post('register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:5,1,member-register');

    // Linking partner di form registrasi member ("Are you a Partner?").
    Route::post('register/partner-link/request', [PartnerLinkOtpController::class, 'request'])
        ->middleware('throttle:5,1,partner-link-request')
        ->name('register.partner-link.request');

    Route::post('register/partner-link/verify', [PartnerLinkOtpController::class, 'verify'])
        ->middleware('throttle:10,1,partner-link-verify')
        ->name('register.partner-link.verify');
});

Route::middleware('auth')->group(function () {
    Route::get('verify-email', EmailVerificationPromptController::class)
        ->name('verification.notice');

    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1,verification-verify'])
        ->name('verification.verify');

    Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1,verification-send')
        ->name('verification.send');

    Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
        ->name('password.confirm');

    Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);

    Route::get('first-change-password', [InitialPasswordController::class, 'create'])
        ->name('password.change-initial');

    Route::post('first-change-password', [InitialPasswordController::class, 'store'])
        ->name('password.change-initial.update');

    Route::put('password', [PasswordController::class, 'update'])->name('password.update');

    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');
});

// ---------- PARTNER GUARD (terpisah dari web) ----------
Route::middleware('auth:partner')->group(function () {
    Route::get('partner/first-change-password', [InitialPasswordController::class, 'create'])
        ->name('partner.password.change-initial');

    Route::post('partner/first-change-password', [InitialPasswordController::class, 'store'])
        ->name('partner.password.change-initial.update');

    Route::post('partner/logout', [AuthenticatedSessionController::class, 'destroyPartner'])
        ->name('partner.logout');
});
