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
        if (! $promo->isActive()) {
            abort(404);
        }

        return Inertia::render('Member/Promos/Show', [
            'promo' => $promo->load('partner:id,name,slug,category,logo,address,phone,email'),
            'member_active' => auth()->user()->hasActiveMembership(),
        ]);
    }
}