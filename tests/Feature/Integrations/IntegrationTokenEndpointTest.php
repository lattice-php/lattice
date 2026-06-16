<?php
declare(strict_types=1);

use Lattice\Lattice\Facades\Lattice;
use Lattice\Lattice\Tests\Fixtures\Discovery\DemoCrmIntegration;

test('integration definitions can be registered explicitly', function (): void {
    Lattice::integrations([DemoCrmIntegration::class]);

    $definition = Lattice::integrationRegistry()->resolve('fixtures.crm');

    expect($definition)->toBeInstanceOf(DemoCrmIntegration::class);
});
