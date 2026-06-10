<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Http\Controllers\ActionController;
use Lattice\Lattice\Http\Controllers\BulkActionController;
use Lattice\Lattice\Http\Controllers\FormController;
use Lattice\Lattice\Http\Controllers\FragmentController;
use Lattice\Lattice\Http\Controllers\TableController;

Route::middleware(config('lattice.forms.middleware', ['web']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.forms.endpoint', 'lattice/forms/{form}'), FormController::class)
    ->where('form', '.*')
    ->name('lattice.forms.handle');

Route::middleware(config('lattice.tables.middleware', ['web']))
    ->get(config('lattice.tables.endpoint', 'lattice/tables/{table}'), TableController::class)
    ->where('table', '.*')
    ->name('lattice.tables.show');

Route::middleware(config('lattice.fragments.middleware', ['web']))
    ->get(config('lattice.fragments.endpoint', 'lattice/fragments/{fragment}'), FragmentController::class)
    ->where('fragment', '.*')
    ->name('lattice.fragments.show');

Route::middleware(config('lattice.actions.middleware', ['web']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.actions.endpoint', 'lattice/actions/{action}'), ActionController::class)
    ->where('action', '.*')
    ->name('lattice.actions.handle');

Route::middleware(config('lattice.bulk-actions.middleware', ['web']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.bulk-actions.endpoint', 'lattice/bulk-actions/{bulkAction}'), BulkActionController::class)
    ->where('bulkAction', '.*')
    ->name('lattice.bulk-actions.handle');
