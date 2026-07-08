<?php
declare(strict_types=1);

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Core\Discovery\DiscoveryKinds;

test('AsBlock carries a registry key', function (): void {
    $attribute = new AsBlock('hero');

    expect($attribute->key)->toBe('hero');
});

test('the service provider registers the blocks discovery group', function (): void {
    expect(DiscoveryKinds::components())
        ->toHaveKey('blocks')
        ->and(DiscoveryKinds::components()['blocks'])->toBe(AsBlock::class);
});
