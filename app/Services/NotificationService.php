<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public function send(User|int $user, string $title, string $body, ?string $type = null, ?string $actionUrl = null): AppNotification
    {
        return AppNotification::create([
            'user_id' => $user instanceof User ? $user->id : $user,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'action_url' => $actionUrl,
        ]);
    }

    public function broadcastToMembers(string $title, string $body, ?string $type = null, ?string $actionUrl = null): int
    {
        $memberIds = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->pluck('id');

        $now = now();

        $rows = $memberIds->map(fn (int $id) => [
            'user_id' => $id,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'action_url' => $actionUrl,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        if ($rows === []) {
            return 0;
        }

        DB::table('app_notifications')->insert($rows);

        return count($rows);
    }

    public function markAllAsRead(User $user): void
    {
        AppNotification::query()
            ->forUser($user->id)
            ->unread()
            ->update(['read_at' => now()]);
    }
}