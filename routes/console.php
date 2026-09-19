<?php

use App\Models\Promo;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(function () {
    Promo::query()
        ->where('is_active', true)
        ->whereNotNull('end_date')
        ->whereDate('end_date', '<', now()->toDateString())
        ->update(['is_active' => false]);
})->daily()->name('deactivate-expired-promos');

