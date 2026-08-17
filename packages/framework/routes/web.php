<?php
declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Lattice\Http\Controllers\BulkActionController;
use Lattice\Http\Controllers\FragmentController;
use Lattice\Http\Controllers\RemoteSourceTokenController;
use Lattice\Notifications\NotificationRoutes;

Route::middleware(config('lattice.bulk-actions.middleware'))
    ->match(['post', 'put', 'patch', 'delete'], 'lattice/bulk-actions/{bulkAction}', BulkActionController::class)
    ->where('bulkAction', '.*')
    ->name('lattice.bulk-actions.handle');

Route::middleware(config('lattice.fragments.middleware'))
    ->get('lattice/fragments/{fragment}', FragmentController::class)
    ->where('fragment', '.*')
    ->name('lattice.fragments.show');

Route::middleware(config('lattice.remote-sources.middleware'))
    ->post('lattice/remote-sources/{source}/token', RemoteSourceTokenController::class)
    ->where('source', '.*')
    ->name('lattice.remote-sources.token');

NotificationRoutes::register();
