<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoginLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = UserLoginLog::query()->with('user:id,name,email,member_code,role');

        $search = $request->string('search')->toString();
        $role = $request->string('role')->toString();
        $portal = $request->string('portal')->toString();
        $from = $request->string('from')->toString();
        $to = $request->string('to')->toString();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('member_code', 'like', "%{$search}%"));
            });
        }

        if (in_array($role, User::ROLES, true)) {
            $query->whereHas('user', fn ($u) => $u->where('role', $role));
        }

        if (in_array($portal, [UserLoginLog::PORTAL_MEMBER, UserLoginLog::PORTAL_PARTNER, UserLoginLog::PORTAL_ADMIN], true)) {
            $query->where('portal', $portal);
        }

        if ($from !== '') {
            $query->whereDate('created_at', '>=', $from);
        }

        if ($to !== '') {
            $query->whereDate('created_at', '<=', $to);
        }

        $logs = $query->orderByDesc('created_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('Admin/LoginLogs/Index', [
            'logs' => $logs,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'portal' => $portal,
                'from' => $from,
                'to' => $to,
            ],
            'stats' => [
                'total' => UserLoginLog::query()->count(),
                'today' => UserLoginLog::query()->whereDate('created_at', today())->count(),
                'unique_users' => UserLoginLog::query()->whereDate('created_at', '>=', now()->subDays(7))->distinct('user_id')->count('user_id'),
            ],
        ]);
    }
}
