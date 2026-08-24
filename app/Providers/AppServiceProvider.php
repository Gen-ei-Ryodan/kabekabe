<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
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

        Blade::directive('routes', function ($group) {
            $args = empty($group) ? 'null, Vite::cspNonce()' : "{$group}, Vite::cspNonce()";

            return "<?php echo app('" . BladeRouteGenerator::class . "')->generate({$args}); ?>";
        });
    }
}
