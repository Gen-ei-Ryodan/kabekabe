<?php

use App\Http\Controllers\Admin\CommunityController as AdminCommunityController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\HomeBannerController as AdminHomeBannerController;
use App\Http\Controllers\Admin\IntegrationController as AdminIntegrationController;
use App\Http\Controllers\Admin\MemberController as AdminMemberController;
use App\Http\Controllers\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Admin\PartnerController as AdminPartnerController;
use App\Http\Controllers\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Admin\PromoController as AdminPromoController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\TransactionController as AdminTransactionController;
use App\Http\Controllers\Member\AccountController;
use App\Http\Controllers\Member\HistoryController;
use App\Http\Controllers\Member\HomeController;
use App\Http\Controllers\Member\NotificationController as MemberNotificationController;
use App\Http\Controllers\Member\PartnerController as MemberPartnerController;
use App\Http\Controllers\Member\PromoController as MemberPromoController;
use App\Http\Controllers\Vendor\DashboardController as VendorDashboardController;
use App\Http\Controllers\Vendor\PromoController as VendorPromoController;
use App\Http\Controllers\Vendor\ReportController as VendorReportController;
use App\Http\Controllers\Vendor\TransactionController as VendorTransactionController;
use App\Http\Controllers\Vendor\VerifyController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $user = auth()->user();

    if (! $user) {
        return redirect()->route('login');
    }

    return match ($user->role) {
        User::ROLE_ADMIN => redirect()->route('admin.dashboard'),
        User::ROLE_VENDOR => redirect()->route('vendor.dashboard'),
        default => redirect()->route('member.home'),
    };
});

Route::middleware(['auth', 'verified'])->group(function () {

    // ---------- MEMBER ----------
    Route::middleware('role:member')->prefix('member')->name('member.')->group(function () {
        Route::get('/home', HomeController::class)->name('home');

        Route::get('/promos/{promo}', [MemberPromoController::class, 'show'])->name('promos.show');

        Route::get('/partners', [MemberPartnerController::class, 'index'])->name('partners.index');
        Route::get('/partners/{partner}', [MemberPartnerController::class, 'show'])->name('partners.show');

        Route::get('/history', HistoryController::class)->name('history.index');

        Route::get('/notifications', [MemberNotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/read-all', [MemberNotificationController::class, 'readAll'])->name('notifications.read-all');
        Route::post('/notifications/{notification}/read', [MemberNotificationController::class, 'read'])->name('notifications.read');

        Route::get('/account', [AccountController::class, 'edit'])->name('account.edit');
        Route::put('/account', [AccountController::class, 'update'])->name('account.update');
    });

    // ---------- VENDOR ----------
    Route::middleware('role:vendor')->prefix('vendor')->name('vendor.')->group(function () {
        Route::get('/dashboard', VendorDashboardController::class)->name('dashboard');

        Route::get('/verify', [VerifyController::class, 'index'])->name('verify');
        Route::get('/verify/{token}', [VerifyController::class, 'check'])->name('verify.token');

        Route::get('/promos', [VendorPromoController::class, 'index'])->name('promos.index');
        Route::get('/promos/create', [VendorPromoController::class, 'create'])->name('promos.create');
        Route::post('/promos', [VendorPromoController::class, 'store'])->name('promos.store');
        Route::get('/promos/{promo}/edit', [VendorPromoController::class, 'edit'])->name('promos.edit');
        Route::put('/promos/{promo}', [VendorPromoController::class, 'update'])->name('promos.update');
        Route::delete('/promos/{promo}', [VendorPromoController::class, 'destroy'])->name('promos.destroy');

        Route::get('/transactions', [VendorTransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/create', [VendorTransactionController::class, 'create'])->name('transactions.create');
        Route::post('/transactions', [VendorTransactionController::class, 'store'])->name('transactions.store');

        Route::get('/reports', VendorReportController::class)->name('reports.index');
    });

    // ---------- ADMIN ----------
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', AdminDashboardController::class)->name('dashboard');

        Route::get('/members', [AdminMemberController::class, 'index'])->name('members.index');
        Route::get('/members/create', [AdminMemberController::class, 'create'])->name('members.create');
        Route::post('/members', [AdminMemberController::class, 'store'])->name('members.store');
        Route::get('/members/import-template', [AdminMemberController::class, 'importTemplate'])->name('members.import.template');
        Route::post('/members/import', [AdminMemberController::class, 'import'])->name('members.import');
        Route::get('/members/{member}', [AdminMemberController::class, 'show'])->name('members.show');
        Route::get('/members/{member}/edit', [AdminMemberController::class, 'edit'])->name('members.edit');
        Route::put('/members/{member}', [AdminMemberController::class, 'update'])->name('members.update');
        Route::put('/members/{member}/status', [AdminMemberController::class, 'toggleStatus'])->name('members.toggle');
        Route::delete('/members/{member}', [AdminMemberController::class, 'destroy'])->name('members.destroy');

        Route::get('/partners', [AdminPartnerController::class, 'index'])->name('partners.index');
        Route::get('/partners/create', [AdminPartnerController::class, 'create'])->name('partners.create');
        Route::post('/partners', [AdminPartnerController::class, 'store'])->name('partners.store');
        Route::get('/partners/{partner}/edit', [AdminPartnerController::class, 'edit'])->name('partners.edit');
        Route::put('/partners/{partner}', [AdminPartnerController::class, 'update'])->name('partners.update');
        Route::put('/partners/{partner}/toggle', [AdminPartnerController::class, 'toggle'])->name('partners.toggle');
        Route::delete('/partners/{partner}', [AdminPartnerController::class, 'destroy'])->name('partners.destroy');

        Route::get('/promos', [AdminPromoController::class, 'index'])->name('promos.index');
        Route::get('/promos/{promo}/edit', [AdminPromoController::class, 'edit'])->name('promos.edit');
        Route::put('/promos/{promo}', [AdminPromoController::class, 'update'])->name('promos.update');
        Route::put('/promos/{promo}/approve', [AdminPromoController::class, 'approve'])->name('promos.approve');
        Route::put('/promos/{promo}/reject', [AdminPromoController::class, 'reject'])->name('promos.reject');
        Route::put('/promos/{promo}/toggle', [AdminPromoController::class, 'toggle'])->name('promos.toggle');

        Route::get('/payments', [AdminPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/create', [AdminPaymentController::class, 'create'])->name('payments.create');
        Route::post('/payments', [AdminPaymentController::class, 'store'])->name('payments.store');
        Route::get('/payments/import-template', [AdminPaymentController::class, 'importTemplate'])->name('payments.import.template');
        Route::post('/payments/import', [AdminPaymentController::class, 'import'])->name('payments.import');
        Route::get('/payments/{payment}', [AdminPaymentController::class, 'show'])->name('payments.show');
        Route::put('/payments/{payment}/approve', [AdminPaymentController::class, 'approve'])->name('payments.approve');
        Route::put('/payments/{payment}/reject', [AdminPaymentController::class, 'reject'])->name('payments.reject');

        Route::get('/banners', [AdminHomeBannerController::class, 'index'])->name('banners.index');
        Route::get('/banners/create', [AdminHomeBannerController::class, 'create'])->name('banners.create');
        Route::post('/banners', [AdminHomeBannerController::class, 'store'])->name('banners.store');
        Route::get('/banners/{banner}/edit', [AdminHomeBannerController::class, 'edit'])->name('banners.edit');
        Route::put('/banners/{banner}', [AdminHomeBannerController::class, 'update'])->name('banners.update');
        Route::put('/banners/{banner}/toggle', [AdminHomeBannerController::class, 'toggle'])->name('banners.toggle');
        Route::delete('/banners/{banner}', [AdminHomeBannerController::class, 'destroy'])->name('banners.destroy');

        Route::get('/community', [AdminCommunityController::class, 'index'])->name('community.index');
        Route::get('/community/create', [AdminCommunityController::class, 'create'])->name('community.create');
        Route::post('/community', [AdminCommunityController::class, 'store'])->name('community.store');
        Route::get('/community/{info}/edit', [AdminCommunityController::class, 'edit'])->name('community.edit');
        Route::put('/community/{info}', [AdminCommunityController::class, 'update'])->name('community.update');
        Route::delete('/community/{info}', [AdminCommunityController::class, 'destroy'])->name('community.destroy');

        Route::get('/notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications', [AdminNotificationController::class, 'store'])->name('notifications.store');

        Route::get('/transactions', [AdminTransactionController::class, 'index'])->name('transactions.index');
        Route::get('/transactions/{transaction}', [AdminTransactionController::class, 'show'])->name('transactions.show');

        Route::get('/integrations', AdminIntegrationController::class)->name('integrations.index');
        Route::post('/integrations/faspay/test', [AdminIntegrationController::class, 'faspayTest'])->name('integrations.faspay.test');
        Route::post('/integrations/wa-blast/send', [AdminIntegrationController::class, 'waBlastSend'])->name('integrations.wa-blast.send');
        Route::get('/payments/{payment}/faspay/dummy', [AdminIntegrationController::class, 'faspayDummy'])->name('payments.faspay.dummy');

        Route::get('/reports', AdminReportController::class)->name('reports.index');
    });
});

require __DIR__.'/auth.php';