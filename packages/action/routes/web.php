<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Actions\Http\Controllers\ActionController;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;

app(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
    Route::middleware($area->middleware('actions'))
        ->match(['post', 'put', 'patch', 'delete'], $area->uri('actions/{action}'), ActionController::class)
        ->where('action', '.*')
        ->name($area->routeName('lattice.actions.handle'));
});
