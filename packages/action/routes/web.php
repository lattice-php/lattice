<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Actions\ActionRegistry;
use Lattice\Actions\Http\Controllers\ActionController;
use Lattice\Core\Http\Middleware\DefinitionMiddleware;

Route::middleware(DefinitionMiddleware::for(ActionRegistry::class, 'action', 'lattice.actions.middleware'))
    ->match(['post', 'put', 'patch', 'delete'], 'lattice/actions/{action}', ActionController::class)
    ->where('action', '.*')
    ->name('lattice.actions.handle');
