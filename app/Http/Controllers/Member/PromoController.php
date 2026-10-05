<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Promo;
use Inertia\Inertia;
use Inertia\Response;

class PromoController extends Controller
{
    public function show(Promo $promo): Response
    {
        // Promo yang belum/tidak pernah disetujui (pending/rejected) tetap disembunyikan.
        if ($promo->status !== Promo::STATUS_APPROVED) {
            abort(404);
        }

        // Promo approved tapi tidak sedang berlaku → tetap ditampilkan dengan status
        // khusus, supaya link lama (notifikasi/email/banner) tidak mentok halaman 404.
        $state = null;
        if (! $promo->isActive()) {
            $state = $promo->start_date?->isFuture() ? 'upcoming' : 'expired';
        }

        return Inertia::render('Member/Promos/Show', [
            'promo' => $promo->load('partner:id,name,slug,category,logo,address,phone,email'),
            'member_active' => auth()->user()->hasActiveMembership(),
            'state' => $state,
        ]);
    }
}
