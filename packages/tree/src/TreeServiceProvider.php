<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;

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

        // Core's routes file has no contribution seam, so the package registers
        // its endpoint itself, mirroring core's group conventions
        // (config lattice.trees.{middleware,endpoint}).
        Route::middleware(config('lattice.trees.middleware', ['web', 'auth']))
            ->get((string) config('lattice.trees.endpoint', 'lattice/trees/{tree}'), TreeController::class)
            ->where('tree', '.*')
            ->name('lattice.trees.show');
    }
}
