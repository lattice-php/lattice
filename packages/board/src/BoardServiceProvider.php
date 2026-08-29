<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;

final class BoardServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        DiscoveryKinds::register('boards', AsBoard::class);

        $this->app->singleton(BoardRegistry::class);
    }

    public function boot(): void
    {
        Lattice::translations('board', __DIR__.'/../lang');

        // Core's routes file has no contribution seam, so the package registers
        // its endpoint itself, mirroring core's group conventions
        // (config lattice.boards.{middleware,endpoint}).
        Route::middleware(config('lattice.boards.middleware', ['web', 'auth']))
            ->get((string) config('lattice.boards.endpoint', 'lattice/boards/{board}'), BoardController::class)
            ->where('board', '.*')
            ->name('lattice.boards.show');
    }
}
