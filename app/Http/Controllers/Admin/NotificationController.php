<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendNotificationRequest;
use App\Models\AppNotification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notifications,
    ) {}

    public function index(): Response
    {
        return Inertia::render('Admin/Notifications/Index', [
            'sent' => AppNotification::query()
                ->with('user:id,name,member_code')
                ->latest()
                ->limit(30)
                ->get(),
            'members' => User::query()
                ->where('role', User::ROLE_MEMBER)
                ->orderBy('name')
                ->get(['id', 'name', 'member_code']),
        ]);
    }

    public function store(SendNotificationRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $recipientId = $validated['recipient_id'] ?? null;

        if ($recipientId) {
            $this->notifications->send(
                $recipientId,
                $validated['title'],
                $validated['body'],
                $validated['type'] ?? null,
                $validated['action_url'] ?? null,
            );

            $message = 'Notifikasi terkirim ke member terpilih.';
        } else {
            $count = $this->notifications->broadcastToMembers(
                $validated['title'],
                $validated['body'],
                $validated['type'] ?? null,
                $validated['action_url'] ?? null,
            );

            $message = "Notifikasi terkirim ke {$count} member.";
        }

        return redirect()
            ->route('admin.notifications.index')
            ->with('success', $message);
    }
}