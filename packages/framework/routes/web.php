<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Core\Services\EndpointAreas;
use Lattice\Core\Values\EndpointArea;
use Lattice\Http\Controllers\BulkActionController;
use Lattice\Http\Controllers\FragmentController;
use Lattice\Http\Controllers\NotificationController;
use Lattice\Http\Controllers\RemoteSourceTokenController;

app(EndpointAreas::class)->routes(static function (EndpointArea $area): void {
    Route::middleware($area->middleware('bulk-actions'))
        ->match(['post', 'put', 'patch', 'delete'], $area->uri('bulk-actions/{bulkAction}'), BulkActionController::class)
        ->where('bulkAction', '.*')
        ->name($area->routeName('lattice.bulk-actions.handle'));

    Route::middleware($area->middleware('fragments'))
        ->get($area->uri('fragments/{fragment}'), FragmentController::class)
        ->where('fragment', '.*')
        ->name($area->routeName('lattice.fragments.show'));

    Route::middleware($area->middleware('remote-sources'))
        ->post($area->uri('remote-sources/{source}/token'), RemoteSourceTokenController::class)
        ->where('source', '.*')
        ->name($area->routeName('lattice.remote-sources.token'));
});

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
