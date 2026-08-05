<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Table\Http\Controllers\TableController;

Route::middleware(config('lattice.tables.middleware', ['web', 'auth']))
    ->get('lattice/tables/{table}', TableController::class)
    ->where('table', '.*')
    ->name('lattice.tables.show');
