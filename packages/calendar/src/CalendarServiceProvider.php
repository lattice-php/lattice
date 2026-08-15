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
        DiscoveryKinds::register('calendars', AsCalendar::class);

        $this->app->singleton(CalendarRegistry::class);
    }

    public function boot(): void
    {
        Lattice::translations('calendar', __DIR__.'/../lang');

        // Core's routes file has no contribution seam, so the package registers
        // its endpoint itself, mirroring core's group conventions
        // (config lattice.calendars.{middleware,endpoint}).
        Route::middleware(config('lattice.calendars.middleware', ['web', 'auth']))
            ->match(['get', 'patch'], (string) config('lattice.calendars.endpoint', 'lattice/calendars/{calendar}'), CalendarController::class)
            ->where('calendar', '.*')
            ->name('lattice.calendars.show');
    }
}
