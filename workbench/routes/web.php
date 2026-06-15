<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Workbench\App\Http\Controllers\ChatStreamController;
use Workbench\App\Http\Controllers\SessionController;
use Workbench\App\Http\Controllers\StreamDemoController;

Route::post('/login', [SessionController::class, 'store'])->name('login.store');
Route::post('/logout', [SessionController::class, 'destroy'])->name('logout');

Route::middleware(['web', 'auth'])->group(function (): void {
    Route::post('/workbench/stream-demo', StreamDemoController::class)
        ->name('workbench.stream-demo');

    Route::post('/workbench/chat', ChatStreamController::class)
        ->name('workbench.chat');
});
