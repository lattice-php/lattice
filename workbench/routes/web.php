<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Workbench\App\Http\Controllers\WorkbenchSessionController;

Route::post('/login', [WorkbenchSessionController::class, 'store'])->name('login.store');
Route::post('/logout', [WorkbenchSessionController::class, 'destroy'])->name('logout');
