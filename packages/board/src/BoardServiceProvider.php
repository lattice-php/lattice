<?php
declare(strict_types=1);

namespace Lattice\Board;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;

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

        $this->app->make(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
            Route::middleware($area->middleware('boards'))
                ->get($area->uri('boards/{board}', 'lattice.boards.endpoint'), BoardController::class)
                ->where('board', '.*')
                ->name($area->routeName('lattice.boards.show'));
        });
    }
}
