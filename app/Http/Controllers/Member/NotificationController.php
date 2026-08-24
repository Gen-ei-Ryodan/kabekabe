<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
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
        $user = auth()->user();

        $notifications = $user->appNotifications()
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Member/Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function read(Request $request, AppNotification $notification): RedirectResponse
    {
        abort_unless($notification->user_id === $request->user()->id, 403);

        $notification->markAsRead();

        if ($notification->action_url) {
            return redirect($notification->action_url);
        }

        return back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $this->notifications->markAllAsRead($request->user());

        return back();
    }
}