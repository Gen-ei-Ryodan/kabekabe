<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\EnsurePasswordUpdated::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
        ]);

        $middleware->appendToGroup('web', \App\Http\Middleware\SecurityHeaders::class);

        $middleware->validateCsrfTokens(except: [
            'api/doku/*',
        ]);

        $middleware->trustProxies(at: ['*']);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Guest redirect per portal: /vendor* + /partner* -> login partner,
        // /admin* -> login admin, sisanya default ke /login (member).
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if (in_array('partner', $e->guards(), true)) {
                return redirect()->route('partner.login');
            }

            if ($request->is('admin', 'admin/*')) {
                return redirect()->route('admin.login');
            }

            return null;
        });
    })->create();
