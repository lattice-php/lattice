<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;

final class CalendarServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        DiscoveryKinds::register('timelines', AsTimeline::class);

        $this->app->singleton(TimelineRegistry::class);
    }

    public function boot(): void
    {
        Lattice::translations('calendar', __DIR__.'/../lang');

        // Core's routes file has no contribution seam, so the package registers
        // its endpoint itself, mirroring core's group conventions
        // (config lattice.timelines.{middleware,endpoint}).
        Route::middleware(config('lattice.timelines.middleware', ['web', 'auth']))
            ->match(['get', 'patch'], (string) config('lattice.timelines.endpoint', 'lattice/timelines/{timeline}'), TimelineController::class)
            ->where('timeline', '.*')
            ->name('lattice.timelines.show');
    }
}
