<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\MemberScan;
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

        $vendorUser = $request->user('partner') ?? \Illuminate\Support\Facades\Auth::guard('partner')->user() ?? $request->user();
        $partner = $vendorUser?->partner;
        $vendorId = $partner ? $partner->user_id : $vendorUser?->id;
        $scan = null;

        if ($active && $vendorId) {
            $scan = MemberScan::startFor($member->id, $vendorId, $request->ip());
        }

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
                'scan' => $scan ? [
                    'id' => $scan->id,
                    'scanned_at' => $scan->scanned_at?->format('d M Y H:i'),
                    'expires_at' => $scan->expires_at?->format('d M Y H:i'),
                    'hours_left' => MemberScan::SCAN_WINDOW_HOURS,
                ] : null,
                'within_window' => true,
                'scan_window_hours' => MemberScan::SCAN_WINDOW_HOURS,
            ],
        ]);
    }
}
