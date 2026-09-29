<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserLoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Mencatat riwayat login (IP, device, lokasi) untuk semua portal.
 */
class LoginLogger
{
    private const GEO_UNKNOWN = '__unknown__';

    public function record(User $user, string $guard, string $portal, Request $request): UserLoginLog
    {
        $ip = $request->ip();
        $agent = (string) $request->userAgent();

        return UserLoginLog::create([
            'user_id' => $user->id,
            'guard' => $guard,
            'portal' => $portal,
            'ip_address' => $ip,
            'user_agent' => $agent !== '' ? mb_substr($agent, 0, 500) : null,
            'browser' => $this->browser($agent),
            'platform' => $this->platform($agent),
            'device' => $this->device($agent),
            'location' => $this->location($ip),
        ]);
    }

    private function containsAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($haystack, $needle)) {
                return true;
            }
        }

        return false;
    }

    private function browser(string $ua): string
    {
        return match (true) {
            str_contains($ua, 'Edg/') => 'Edge',
            $this->containsAny($ua, ['OPR/', 'Opera']) => 'Opera',
            str_contains($ua, 'Firefox/') => 'Firefox',
            str_contains($ua, 'Chrome/') => 'Chrome',
            str_contains($ua, 'Safari/') => 'Safari',
            $this->containsAny($ua, ['curl/', 'wget/', 'python-requests']) => 'CLI / Script',
            default => 'Lainnya',
        };
    }

    private function platform(string $ua): string
    {
        return match (true) {
            str_contains($ua, 'Windows NT') => 'Windows',
            str_contains($ua, 'Android') => 'Android',
            $this->containsAny($ua, ['iPhone', 'iPad', 'iPod']) => 'iOS',
            str_contains($ua, 'Mac OS X') => 'macOS',
            str_contains($ua, 'Linux') => 'Linux',
            default => 'Lainnya',
        };
    }

    private function device(string $ua): string
    {
        if (preg_match('/iPad|Tablet|PlayBook|Silk/i', $ua)) {
            return 'Tablet';
        }

        if (preg_match('/Mobile|Android|iPhone|iPod|Windows Phone|BlackBerry/i', $ua)) {
            return 'Ponsel';
        }

        return 'Desktop';
    }

    /**
     * Lokasi berbasis IP terbaik: IP privat -> jaringan lokal, sisanya lookup ringkas
     * dengan cache. Gagal lookup tidak menggagalkan login.
     */
    private function location(?string $ip): ?string
    {
        if (! $ip) {
            return null;
        }

        $public = filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        );

        if (! $public) {
            return 'Jaringan Lokal / Private';
        }

        $cached = Cache::get("login-geo:{$ip}");

        if ($cached !== null) {
            return $cached === self::GEO_UNKNOWN ? null : $cached;
        }

        $resolved = null;

        try {
            $data = Http::timeout(1)
                ->get("https://ipapi.co/{$ip}/json/")
                ->json();

            if (is_array($data) && empty($data['error'])) {
                $parts = array_filter([
                    $data['city'] ?? null,
                    $data['region'] ?? null,
                    $data['country_name'] ?? null,
                ]);

                $resolved = $parts ? implode(', ', $parts) : null;
            }
        } catch (Throwable) {
            $resolved = null;
        }

        // Null ikut di-cache agar IP yang lookup-nya gagal tidak dipanggil ulang tiap login.
        Cache::put("login-geo:{$ip}", $resolved ?? self::GEO_UNKNOWN, $resolved ? now()->addDays(7) : now()->addHours(6));

        return $resolved;
    }
}
