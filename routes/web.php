<?php

declare(strict_types=1);

use Bambamboole\Lattice\Http\Controllers\ActionController;
use Bambamboole\Lattice\Http\Controllers\FormController;
use Bambamboole\Lattice\Http\Controllers\TableController;
use Illuminate\Support\Facades\Route;

Route::middleware(config('lattice.forms.middleware', ['web']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.forms.endpoint', 'lattice/forms/{form}'), FormController::class)
    ->where('form', '.*')
    ->name('lattice.forms.handle');

Route::middleware(config('lattice.tables.middleware', ['web']))
    ->get(config('lattice.tables.endpoint', 'lattice/tables/{table}'), TableController::class)
    ->where('table', '.*')
    ->name('lattice.tables.show');

Route::middleware(config('lattice.actions.middleware', ['web']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.actions.endpoint', 'lattice/actions/{action}'), ActionController::class)
    ->where('action', '.*')
    ->name('lattice.actions.handle');
