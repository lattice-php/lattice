<?php

declare(strict_types=1);

namespace Lattice\Pdf;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Facades\Lattice;
use Lattice\Pdf\Http\WorkerAssetController;

final class PdfServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/pdf.php', 'pdf');
    }

    public function boot(): void
    {
        Lattice::translations('pdf', __DIR__.'/../lang');

        // Core's routes file has no contribution seam, so the package serves
        // the pdf.js worker artifact itself (config pdf.{middleware,asset_route}).
        Route::middleware(config('pdf.middleware', ['web']))
            ->get((string) config('pdf.asset_route', 'lattice/pdf/worker.js'), WorkerAssetController::class)
            ->name('lattice.pdf.worker');
    }
}
