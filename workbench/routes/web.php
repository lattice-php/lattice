<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Workbench\App\Http\Controllers\ChatAgentController;
use Workbench\App\Http\Controllers\ConversationHistoryController;
use Workbench\App\Http\Controllers\FakeExternalCustomersController;
use Workbench\App\Http\Controllers\SessionController;

Route::post('/login', [SessionController::class, 'store'])->name('login.store');
Route::post('/logout', [SessionController::class, 'destroy'])->name('logout');

Route::middleware(['web', 'auth'])->group(function (): void {
    Route::get('/workbench/chat/history', ConversationHistoryController::class)
        ->name('workbench.chat.history');

    Route::post('/workbench/chat/stream', ChatAgentController::class)
        ->name('workbench.chat.stream');

    Route::get('/workbench/external/customers', FakeExternalCustomersController::class)
        ->name('workbench.external.customers');
});
