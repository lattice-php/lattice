<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Discovery\DiscoveryKinds;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Tests\Fixtures\Discovery\AsWidget;
use Lattice\Lattice\Tests\Fixtures\Discovery\DiscoveredWidget;

afterEach(function (): void {
    DiscoveryKinds::flush();
});

test('components() merges a registered group over the built-in groups', function (): void {
    DiscoveryKinds::register('widgets', AsWidget::class);

    expect(DiscoveryKinds::components())
        ->toHaveKey('forms')
        ->toHaveKey('widgets')
        ->and(DiscoveryKinds::components()['widgets'])->toBe(AsWidget::class);
});

test('a registered discovery group is scanned and discovered by the manifest', function (): void {
    DiscoveryKinds::register('widgets', AsWidget::class);
    discoverFixtures();

    expect(app(DiscoveryManifest::class)->forGroup('widgets'))
        ->toBe(['fixtures.widget' => DiscoveredWidget::class]);
});

test('without registration the group is absent from the manifest', function (): void {
    discoverFixtures();

    expect(app(DiscoveryManifest::class)->forGroup('widgets'))->toBe([]);
});
