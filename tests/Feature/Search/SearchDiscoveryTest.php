<?php
declare(strict_types=1);

use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Facades\Lattice;
use Lattice\Tests\Fixtures\Search\FakeSearchProvider;

it('discovers attributed search providers', function (): void {
    config(['lattice.discover' => [dirname(__DIR__, 2).'/Fixtures/Search']]);
    app(DiscoveryManifest::class)->clear();

    expect(app(DiscoveryManifest::class)->forGroup('search-providers'))
        ->toBe(['products' => FakeSearchProvider::class]);
});

it('registers providers explicitly through the Lattice facade', function (): void {
    config(['lattice.discover' => []]);
    app(DiscoveryManifest::class)->clear();

    Lattice::searchProviders(FakeSearchProvider::class);

    expect(Lattice::searchProviderRegistry()->forCategory('products'))
        ->toBeInstanceOf(FakeSearchProvider::class);
});
