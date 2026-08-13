<?php
declare(strict_types=1);

namespace Lattice\Search;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Core\Facades\Lattice;
use Lattice\Core\LatticeRegistry;
use Lattice\Search\Contracts\SearchHistoryRecorder;
use Lattice\Search\Contracts\SearchResultProvider;

final class SearchServiceProvider extends ServiceProvider
{
    #[\Override]
    public function register(): void
    {
        DiscoveryKinds::register('search-providers', AsSearchProvider::class);

        $this->app->singleton(SearchProviderRegistry::class);
        $this->app->singleton(SearchHistoryRecorder::class, NullSearchHistoryRecorder::class);

        $lattice = $this->app->make(LatticeRegistry::class);
        $lattice->registerCapability('searchProviders', $this->registerProviders(...));
        $lattice->registerCapability('searchProviderRegistry', fn (): SearchProviderRegistry => $this->app->make(SearchProviderRegistry::class));
    }

    public function boot(): void
    {
        Lattice::translations('search', __DIR__.'/../lang');

        $endpoint = (string) config('lattice.search.endpoint', 'lattice/search');
        $middleware = config('lattice.search.middleware', ['web', 'auth']);

        Route::middleware($middleware)
            ->get($endpoint, [SearchController::class, 'search'])
            ->name('lattice.search.index');
        Route::middleware($middleware)
            ->post($endpoint, [SearchController::class, 'record'])
            ->name('lattice.search.record');
    }

    /** @param class-string<SearchResultProvider>|array<int, class-string<SearchResultProvider>> $providers */
    private function registerProviders(string|array $providers): void
    {
        $this->app->make(SearchProviderRegistry::class)->register($providers);
    }
}
