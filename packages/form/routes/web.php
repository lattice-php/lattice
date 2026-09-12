<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Http\Middleware\DefinitionMiddleware;
use Lattice\Form\FormRegistry;
use Lattice\Form\Http\Controllers\FormController;

Route::middleware(DefinitionMiddleware::for(FormRegistry::class, 'form', 'lattice.forms.middleware'))
    ->match(['post', 'put', 'patch', 'delete'], 'lattice/forms/{form}', FormController::class)
    ->where('form', '.*')
    ->name('lattice.forms.handle');
