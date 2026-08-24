<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerifyController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Vendor/Verify', [
            'result' => null,
        ]);
    }

    public function check(Request $request, string $token): Response
    {
        $member = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->where(function ($q) use ($token) {
                $q->where('card_token', $token)->orWhere('member_code', $token);
            })
            ->with('membership')
            ->first();

        if ($member === null) {
            return Inertia::render('Vendor/Verify', [
                'result' => [
                    'found' => false,
                ],
            ]);
        }

        $member->ensureMemberCode();

        $active = $member->hasActiveMembership();

        return Inertia::render('Vendor/Verify', [
            'result' => [
                'found' => true,
                'active' => $active,
                'member' => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'member_code' => $member->member_code,
                    'avatar_url' => $member->avatarUrl(),
                    'company' => $member->company,
                ],
                'status_label' => $active ? 'ACTIVE' : 'INACTIVE',
                'expires_at' => $member->membership?->expires_at?->format('d M Y'),
            ],
        ]);
    }
}