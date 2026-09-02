<?php

namespace App\Services\Whatsapp;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

/**
 * WA Blast service (stub).
 * Real integration is pending — this service stubs the message dispatch
 * so the admin UI flow can be tested before wiring a real provider.
 */
class WaBlastService
{
    public const STATUS_QUEUED = 'queued';
    public const STATUS_SENT = 'sent';
    public const STATUS_FAILED = 'failed';

    public function __construct(
        private readonly string $defaultProvider = 'stub',
    ) {}

    public function send(User $recipient, string $message, array $context = []): array
    {
        $phone = $recipient->whatsapp ?? $recipient->phone;

        if (! $phone) {
            return [
                'success' => false,
                'status' => self::STATUS_FAILED,
                'reason' => 'No phone number',
            ];
        }

        Log::info('WA Blast (stub)', [
            'to' => $phone,
            'recipient_id' => $recipient->id,
            'message_preview' => StrPreview($message),
            'context' => $context,
        ]);

        return [
            'success' => true,
            'status' => self::STATUS_QUEUED,
            'phone' => $phone,
            'provider' => $this->defaultProvider,
            'queued_at' => now()->toIso8601String(),
        ];
    }

    public function broadcast(Collection $recipients, string $message, array $context = []): array
    {
        $results = [];
        foreach ($recipients as $r) {
            $results[] = $this->send($r, $message, $context);
        }

        return [
            'total' => count($results),
            'queued' => count(array_filter($results, fn ($r) => $r['success'] ?? false)),
            'failed' => count(array_filter($results, fn ($r) => ! ($r['success'] ?? false))),
            'results' => $results,
        ];
    }
}

function StrPreview(string $s, int $len = 60): string
{
    return strlen($s) > $len ? substr($s, 0, $len) . '...' : $s;
}