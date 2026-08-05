<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Form\Http\Controllers\FormController;

Route::middleware(config('lattice.forms.middleware', ['web', 'auth']))
    ->match(['post', 'put', 'patch', 'delete'], 'lattice/forms/{form}', FormController::class)
    ->where('form', '.*')
    ->name('lattice.forms.handle');
