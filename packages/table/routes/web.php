<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;
use Lattice\Table\Http\Controllers\TableController;

app(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
    Route::middleware($area->middleware('tables'))
        ->get($area->uri('tables/{table}'), TableController::class)
        ->where('table', '.*')
        ->name($area->routeName('lattice.tables.show'));
});
