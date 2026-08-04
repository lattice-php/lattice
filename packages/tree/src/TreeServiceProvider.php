<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Ui\UiServiceProvider;

final class TreeServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->app->register(UiServiceProvider::class);

        DiscoveryKinds::register('trees', AsTree::class);

        $this->app->singleton(TreeRegistry::class);
    }

    public function boot(): void
    {
        // Registered directly on the loader rather than via loadTranslationsFrom():
        // the i18next route resolves only the translation loader, never the
        // translator, so the deferred loadTranslationsFrom() callback would never fire.
        $this->app->make('translation.loader')->addNamespace('tree', __DIR__.'/../lang');

        // Core's routes file has no contribution seam, so the package registers
        // its endpoint itself, mirroring core's group conventions
        // (config lattice.trees.{middleware,endpoint}).
        Route::middleware(config('lattice.trees.middleware', ['web', 'auth']))
            ->get((string) config('lattice.trees.endpoint', 'lattice/trees/{tree}'), TreeController::class)
            ->where('tree', '.*')
            ->name('lattice.trees.show');
    }
}
