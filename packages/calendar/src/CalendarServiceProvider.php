<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;

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

        $this->app->make(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
            Route::middleware($area->middleware('calendars'))
                ->match(['get', 'patch'], $area->uri('calendars/{calendar}', 'lattice.calendars.endpoint'), CalendarController::class)
                ->where('calendar', '.*')
                ->name($area->routeName('lattice.calendars.show'));
        });
    }
}
