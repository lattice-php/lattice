<?php
declare(strict_types=1);

use Lattice\Lattice\LatticeServiceProvider;

test('the lattice service provider is registered', function (): void {
    expect(app()->getLoadedProviders())->toHaveKey(LatticeServiceProvider::class);
});
