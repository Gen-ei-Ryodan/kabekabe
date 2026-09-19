<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\PartnerAd;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $partner = $user->partner;

        abort_if(! $partner, 403, 'Anda bukan akun Partner.');

        $isActive = $partner->isActive();

        $history = Payment::query()
            ->where('member_id', $user->id)
            ->latest('created_at')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'invoice_number' => $p->invoice_number,
                'period_months' => $p->period_months,
                'amount' => $p->amount,
                'status' => $p->status,
                'paid_at' => $p->paid_at?->translatedFormat('d M Y'),
                'notes' => $p->notes,
            ]);

        $ads = $partner->ads()
            ->with('promo:id,title')
            ->latest('created_at')
            ->get()
            ->map(fn (PartnerAd $ad) => [
                'id' => $ad->id,
                'type' => $ad->type,
                'type_label' => $ad->type === PartnerAd::TYPE_POPUP ? 'Pop-up Pembuka (3 Hari)' : 'Banner Beranda (5 Hari)',
                'promo_title' => $ad->promo_title ?: $ad->promo?->title,
                'image_url' => $ad->imageUrl(),
                'start_date' => $ad->start_date?->format('d M Y'),
                'end_date' => $ad->end_date?->format('d M Y'),
                'start_date_raw' => $ad->start_date?->format('Y-m-d'),
                'end_date_raw' => $ad->end_date?->format('Y-m-d'),
                'status' => $ad->status,
                'notes' => $ad->notes,
                'admin_feedback' => $ad->admin_feedback,
                'created_at' => $ad->created_at?->format('d M Y H:i'),
            ]);

        $promos = $partner->promos()
            ->where('status', 'approved')
            ->get(['id', 'title']);

        return Inertia::render('Vendor/Billing/Index', [
            'partner' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'category' => $partner->category,
                'status' => $partner->status ?? 'active',
                'status_label' => $isActive ? 'AKTIF' : 'TIDAK AKTIF',
                'is_active' => $isActive,
                'expires_at' => $partner->expires_at?->translatedFormat('d M Y'),
                'days_remaining' => $partner->expires_at ? max(0, (int) $partner->expires_at->diffInDays(now())) : null,
            ],
            'ads' => $ads,
            'promos' => $promos,
            'history' => $history,
        ]);
    }

    public function storeAd(Request $request): RedirectResponse
    {
        $partner = auth()->user()->partner;
        abort_if(! $partner, 403);

        $validated = $request->validate([
            'type' => ['required', 'in:popup,banner'],
            'promo_title' => ['required', 'string', 'max:255'],
            'promo_id' => ['nullable', 'integer', 'exists:promos,id'],
            'start_date' => ['required', 'date'],
            'image' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $startDate = Carbon::parse($validated['start_date']);
        // Popup 3 hari, Banner 5 hari
        $durationDays = $validated['type'] === PartnerAd::TYPE_POPUP ? 3 : 5;
        $endDate = $startDate->copy()->addDays($durationDays);

        $imagePath = $request->file('image')->store('partner-ads', 'public');

        PartnerAd::create([
            'partner_id' => $partner->id,
            'promo_id' => $validated['promo_id'] ?? null,
            'type' => $validated['type'],
            'promo_title' => $validated['promo_title'],
            'image_path' => $imagePath,
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'price' => 0,
            'status' => PartnerAd::STATUS_PENDING,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Pengajuan iklan berhasil dikirim! Menunggu persetujuan admin.');
    }

    public function payAd(PartnerAd $ad): RedirectResponse
    {
        $partner = auth()->user()->partner;
        abort_if(! $partner || $ad->partner_id !== $partner->id, 403);

        $ad->update([
            'status' => PartnerAd::STATUS_PAID,
            'paid_at' => now(),
        ]);

        return back()->with('success', 'Konfirmasi pembayaran berhasil dicatat! Admin telah diberitahu untuk segera mengatur penayangan iklan Anda.');
    }
}
