<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Actions\Http\Controllers\ActionController;

Route::middleware(config('lattice.actions.middleware', ['web', 'auth']))
    ->match(['post', 'put', 'patch', 'delete'], 'lattice/actions/{action}', ActionController::class)
    ->where('action', '.*')
    ->name('lattice.actions.handle');
