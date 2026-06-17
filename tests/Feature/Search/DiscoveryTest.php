<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredProductsSearchProvider;

test('search providers are discovered into the search group', function () {
    discoverFixtures();

    $group = app(DiscoveryManifest::class)->forGroup('search');

    expect($group)->toHaveKey('products');
    expect($group['products'])->toBe(DiscoveredProductsSearchProvider::class);
});
