<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Http\Controllers\ActionController;
use Lattice\Http\Controllers\BulkActionController;
use Lattice\Http\Controllers\FragmentController;
use Lattice\Http\Controllers\NotificationController;
use Lattice\Http\Controllers\RemoteSourceTokenController;

Route::middleware(config('lattice.fragments.middleware'))
    ->get('lattice/fragments/{fragment}', FragmentController::class)
    ->where('fragment', '.*')
    ->name('lattice.fragments.show');

Route::middleware(config('lattice.remote-sources.middleware'))
    ->post('lattice/remote-sources/{source}/token', RemoteSourceTokenController::class)
    ->where('source', '.*')
    ->name('lattice.remote-sources.token');

Route::middleware(config('lattice.actions.middleware'))
    ->match(['post', 'put', 'patch', 'delete'], 'lattice/actions/{action}', ActionController::class)
    ->where('action', '.*')
    ->name('lattice.actions.handle');

Route::middleware(config('lattice.bulk-actions.middleware'))
    ->match(['post', 'put', 'patch', 'delete'], 'lattice/bulk-actions/{bulkAction}', BulkActionController::class)
    ->where('bulkAction', '.*')
    ->name('lattice.bulk-actions.handle');

Route::middleware(config('lattice.notifications.middleware', ['web', 'auth']))
    ->prefix(config('lattice.notifications.endpoint', 'lattice/notifications'))
    ->name('lattice.notifications.')
    ->group(function (): void {
        Route::get('/', [NotificationController::class, 'index'])->name('index');
        Route::post('read-all', [NotificationController::class, 'readAll'])->name('read-all');
        Route::patch('{id}/read', [NotificationController::class, 'read'])->name('read');
        Route::delete('{id}', [NotificationController::class, 'destroy'])->name('destroy');
        Route::delete('/', [NotificationController::class, 'clear'])->name('clear');
    });
