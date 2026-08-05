<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Http\Controllers\RefRefreshController;

Route::middleware(config('lattice.refs.middleware', ['web']))
    ->post('lattice/refs/refresh', RefRefreshController::class)
    ->name('lattice.refs.refresh');
