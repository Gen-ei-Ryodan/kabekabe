<?php

namespace App\Providers;

use App\Rules\StrongPassword;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Tighten\Ziggy\BladeRouteGenerator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Semua Password::defaults() (register/reset/ubah password) wajib strong password:
        // minimal 8 karakter, kombinasi huruf dan angka.
        Password::defaults(fn () => new StrongPassword);

        Blade::directive('routes', function ($group) {
            $args = empty($group) ? 'null, Vite::cspNonce()' : "{$group}, Vite::cspNonce()";

            return "<?php echo app('".BladeRouteGenerator::class."')->generate({$args}); ?>";
        });
    }
}
