<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Apply security hardening headers to every response.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $nonce = Str::random(40);
        Vite::useCspNonce($nonce);

        /** @var Response $response */
        $response = $next($request);

        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=()');

        $host = $request->getScheme().'://'.$request->getHost();

        $csp = "default-src 'self'; "
            . "script-src 'self' 'nonce-{$nonce}' 'wasm-unsafe-eval' https://sandbox.doku.com https://jokul.doku.com; "
            . "style-src 'self' 'unsafe-inline' https://fonts.bunny.net {$host} https://8001.digitalblitar.com https://laravel.solusisurabaya.com https://sandbox.doku.com https://jokul.doku.com; "
            . "img-src 'self' data: blob: {$host} https://8001.digitalblitar.com https://laravel.solusisurabaya.com https://sandbox.doku.com https://jokul.doku.com https://staging.doku.com https://*.doku.com; "
            . "font-src 'self' data: https://fonts.bunny.net {$host} https://8001.digitalblitar.com https://laravel.solusisurabaya.com; "
            . "connect-src 'self' ws: wss: {$host} https://8001.digitalblitar.com https://laravel.solusisurabaya.com https://fastly.jsdelivr.net https://api-sandbox.doku.com https://api.doku.com https://sandbox.doku.com https://jokul.doku.com https://staging.doku.com; "
            . "frame-src 'self' https://sandbox.doku.com https://jokul.doku.com https://staging.doku.com; "
            . "media-src 'self' data:; "
            . "object-src 'none'; "
            . "base-uri 'self'; "
            . "frame-ancestors 'self'; "
            . "worker-src 'self' blob:";

        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
