<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Lattice\Http\Controllers\ActionController;
use Lattice\Lattice\Http\Controllers\BulkActionController;
use Lattice\Lattice\Http\Controllers\FormController;
use Lattice\Lattice\Http\Controllers\FragmentController;
use Lattice\Lattice\Http\Controllers\NotificationController;
use Lattice\Lattice\Http\Controllers\RemoteSourceTokenController;
use Lattice\Lattice\Http\Controllers\TableController;

Route::middleware(config('lattice.forms.middleware', ['web', 'auth']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.forms.endpoint', 'lattice/forms/{form}'), FormController::class)
    ->where('form', '.*')
    ->name('lattice.forms.handle');

Route::middleware(config('lattice.tables.middleware', ['web', 'auth']))
    ->get(config('lattice.tables.endpoint', 'lattice/tables/{table}'), TableController::class)
    ->where('table', '.*')
    ->name('lattice.tables.show');

Route::middleware(config('lattice.fragments.middleware', ['web', 'auth']))
    ->get(config('lattice.fragments.endpoint', 'lattice/fragments/{fragment}'), FragmentController::class)
    ->where('fragment', '.*')
    ->name('lattice.fragments.show');

Route::middleware(config('lattice.remote-sources.middleware', ['web', 'auth']))
    ->post(config('lattice.remote-sources.endpoint', 'lattice/remote-sources/{source}/token'), RemoteSourceTokenController::class)
    ->where('source', '.*')
    ->name('lattice.remote-sources.token');

Route::middleware(config('lattice.actions.middleware', ['web', 'auth']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.actions.endpoint', 'lattice/actions/{action}'), ActionController::class)
    ->where('action', '.*')
    ->name('lattice.actions.handle');

Route::middleware(config('lattice.bulk-actions.middleware', ['web', 'auth']))
    ->match(['post', 'put', 'patch', 'delete'], config('lattice.bulk-actions.endpoint', 'lattice/bulk-actions/{bulkAction}'), BulkActionController::class)
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
