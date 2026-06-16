<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\GlobalSearch\SearchResultProviderRegistry;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProductsSearchProvider;

test('providers can be registered explicitly through the facade', function () {
    config(['lattice.discover' => []]);
    app(SearchResultProviderRegistry::class); // ensure singleton built before manifest clear
    app(DiscoveryManifest::class)->clear();

    Lattice::searchProviders([DiscoveredProductsSearchProvider::class]);

    expect(Lattice::searchProviderRegistry()->forCategory('products'))->not->toBeNull();
});
