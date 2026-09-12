<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="KBKB — Platform Digital Membership & Community Management.">

        <title inertia>{{ config('app.name', 'KBKB') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link href="https://fonts.bunny.net/css?family=space+grotesk:500,600,700|inter:400,500,600,700|jetbrains+mono:400,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        <script src="{{ config('services.doku.checkout_js_url', 'https://sandbox.doku.com/jokul-checkout-js/v1/jokul-checkout-1.0.0.js') }}"></script>
        @inertiaHead
    </head>
    <body class="font-sans antialiased bg-paper text-ink selection:bg-gold/25">
        @inertia
    </body>
</html>