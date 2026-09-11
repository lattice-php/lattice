<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;
use Lattice\Form\Http\Controllers\FormController;

app(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
    Route::middleware($area->middleware('forms'))
        ->match(['post', 'put', 'patch', 'delete'], $area->uri('forms/{form}'), FormController::class)
        ->where('form', '.*')
        ->name($area->routeName('lattice.forms.handle'));
});
