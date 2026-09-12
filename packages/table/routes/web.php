<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Http\Middleware\DefinitionMiddleware;
use Lattice\Table\Http\Controllers\TableController;
use Lattice\Table\TableRegistry;

Route::middleware(DefinitionMiddleware::for(TableRegistry::class, 'table', 'lattice.tables.middleware'))
    ->get('lattice/tables/{table}', TableController::class)
    ->where('table', '.*')
    ->name('lattice.tables.show');
