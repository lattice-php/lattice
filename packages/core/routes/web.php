<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Http\Controllers\RefRefreshController;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;

app(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
    Route::middleware($area->middleware('refs', ['web']))
        ->post($area->uri('refs/refresh'), RefRefreshController::class)
        ->name($area->routeName('lattice.refs.refresh'));
});
