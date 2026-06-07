<?php

declare(strict_types=1);

use Bambamboole\Lattice\Http\Controllers\FormController;
use Illuminate\Support\Facades\Route;

Route::middleware(config('lattice.forms.middleware', ['web']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.forms.endpoint', 'lattice/forms/{form}'), FormController::class)
    ->where('form', '.*')
    ->name('lattice.forms.handle');
