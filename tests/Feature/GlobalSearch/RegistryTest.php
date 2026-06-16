<?php
declare(strict_types=1);

use Illuminate\Http\Request;
use Lattice\Lattice\GlobalSearch\Contracts\SearchResultProvider;
use Lattice\Lattice\GlobalSearch\SearchResultProviderRegistry;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProductsSearchProvider;

beforeEach(function () {
    DiscoveredProductsSearchProvider::$authorized = true;
    discoverFixtures();
});

test('the registry resolves a discovered provider by category', function () {
    $registry = app(SearchResultProviderRegistry::class);

    expect($registry->forCategory('products'))->toBeInstanceOf(SearchResultProvider::class);
    expect($registry->forCategory('missing'))->toBeNull();
    expect(array_keys($registry->all()))->toContain('products');
});

test('the registry filters unauthorized providers', function () {
    DiscoveredProductsSearchProvider::$authorized = false;

    $authorized = app(SearchResultProviderRegistry::class)->authorized(new Request);

    expect($authorized)->not->toHaveKey('products');
});
