<?php

declare(strict_types=1);

use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;

it('discovers attributed components under a path with type, flags and category', function () {
    $discovered = (new ComponentDiscovery)->discover(
        __DIR__.'/../../Fixtures/TypeScript',
        'Lattice\\Lattice\\Tests\\Fixtures\\TypeScript',
    );

    $byType = collect($discovered)->keyBy->type;

    expect($byType->has('sample.widget'))->toBeTrue()
        ->and($byType['sample.widget']->container)->toBeTrue()
        ->and($byType['sample.widget']->category)->toBe('component')
        ->and($byType['sample.field']->category)->toBe('field');
});
