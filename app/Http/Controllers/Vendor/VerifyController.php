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

        $vendor = $request->user();
        $scan = null;
        $lastScan = null;
        $withinWindow = false;
        $hoursLeft = 0;

        if ($vendor && $vendor->role === User::ROLE_VENDOR) {
            $lastScan = MemberScan::query()
                ->where('member_id', $member->id)
                ->where('scanned_by_vendor_id', $vendor->id)
                ->latest('scanned_at')
                ->first();

            if ($lastScan && $lastScan->expires_at->isFuture()) {
                $withinWindow = true;
                $hoursLeft = (int) round(now()->diffInMinutes($lastScan->expires_at, false) / 60);
            } else {
                $scan = MemberScan::startFor($member->id, $vendor->id, $request->ip());
                $withinWindow = true;
                $hoursLeft = MemberScan::SCAN_WINDOW_HOURS;
            }
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
                    'scanned_at' => $scan->scanned_at?->format('d M Y H:i'),
                    'expires_at' => $scan->expires_at?->format('d M Y H:i'),
                    'hours_left' => $hoursLeft,
                ] : ($lastScan ? [
                    'scanned_at' => $lastScan->scanned_at?->format('d M Y H:i'),
                    'expires_at' => $lastScan->expires_at?->format('d M Y H:i'),
                    'hours_left' => $hoursLeft,
                ] : null),
                'within_window' => $withinWindow,
                'scan_window_hours' => MemberScan::SCAN_WINDOW_HOURS,
            ],
        ]);
    }
}