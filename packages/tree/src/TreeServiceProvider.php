<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;

final class TreeServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        DiscoveryKinds::register('trees', AsTree::class);

        $this->app->singleton(TreeRegistry::class);
    }

    public function boot(): void
    {
        Lattice::translations('tree', __DIR__.'/../lang');

        $this->app->make(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
            Route::middleware($area->middleware('trees'))
                ->get($area->uri('trees/{tree}', 'lattice.trees.endpoint'), TreeController::class)
                ->where('tree', '.*')
                ->name($area->routeName('lattice.trees.show'));
        });
    }
}
