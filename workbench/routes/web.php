<?php

declare(strict_types=1);

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Support\Facades\Route;
use Workbench\App\Http\Controllers\ChatAgentController;
use Workbench\App\Http\Controllers\ConversationHistoryController;
use Workbench\App\Http\Controllers\FakeRemoteChatHistoryController;
use Workbench\App\Http\Controllers\FakeRemoteChatStreamController;
use Workbench\App\Http\Controllers\FakeRemoteTodosController;
use Workbench\App\Http\Controllers\SessionController;

Route::post('/login', [SessionController::class, 'store'])->name('login.store');
Route::post('/logout', [SessionController::class, 'destroy'])->name('logout');

Route::middleware(['web', 'auth'])->group(function (): void {
    Route::get('/workbench/chat/history', ConversationHistoryController::class)
        ->name('workbench.chat.history');

    Route::post('/workbench/chat/stream', ChatAgentController::class)
        ->name('workbench.chat.stream');

    Route::withoutMiddleware([Authenticate::class, PreventRequestForgery::class])->group(function (): void {
        Route::get('/workbench/remote/todos', FakeRemoteTodosController::class)
            ->name('workbench.remote.todos');

        Route::get('/workbench/remote/chat/history', FakeRemoteChatHistoryController::class)
            ->name('workbench.remote.chat.history');

        Route::post('/workbench/remote/chat/stream', FakeRemoteChatStreamController::class)
            ->name('workbench.remote.chat.stream');
    });
});
