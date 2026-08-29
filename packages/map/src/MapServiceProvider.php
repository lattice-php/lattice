<?php

declare(strict_types=1);

namespace Lattice\Map;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Facades\Lattice;
use Lattice\Map\Providers\GoogleMapsProvider;
use Lattice\Map\Providers\OpenStreetMapProvider;

final class MapServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/map.php', 'map');

        $this->app->singleton(MapProviderRegistry::class, function (Application $app): MapProviderRegistry {
            $registry = new MapProviderRegistry;
            $registry->register($app->make(OpenStreetMapProvider::class));

            if (filled($app->make('config')->get('map.providers.googlemaps.api_key'))) {
                $registry->register($app->make(GoogleMapsProvider::class));
            }

            return $registry;
        });
    }

    public function boot(): void
    {
        Lattice::translations('map', __DIR__.'/../lang');
    }
}
