<?php

declare(strict_types=1);

use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;

it('discovers attributed components under a path with type, flags and category', function () {
    $discovered = (new ComponentDiscovery)->discover(__DIR__.'/../../Fixtures/TypeScript');

    $byType = collect($discovered)->keyBy->type;

    expect($byType)->toHaveKey('sample.widget')->toHaveKey('sample.field');

    $widget = $byType->get('sample.widget');
    $field = $byType->get('sample.field');

    assert($widget instanceof DiscoveredComponent);
    assert($field instanceof DiscoveredComponent);

    expect($widget->container)->toBeTrue()
        ->and($widget->category)->toBe('component')
        ->and($field->category)->toBe('field');
});

it('excludes classes without the Component attribute from discovery', function () {
    $discovered = (new ComponentDiscovery)->discover(__DIR__.'/../../Fixtures/TypeScript');

    $types = collect($discovered)->pluck('type')->all();

    expect($types)->not->toContain('SampleUnattributed');

    $classes = collect($discovered)->pluck('class')->all();
    expect($classes)->not->toContain('Lattice\\Lattice\\Tests\\Fixtures\\TypeScript\\SampleUnattributed');
});

it('returns an empty array when the path does not exist', function () {
    $discovered = (new ComponentDiscovery)->discover(__DIR__.'/../../Fixtures/TypeScript/does-not-exist');

    expect($discovered)->toBe([]);
});

it('derives the domain from the namespace segment before Components', function () {
    $discovered = (new ComponentDiscovery)->discover(dirname(__DIR__, 3).'/src/Core/Components');

    $card = collect($discovered)->keyBy->type->get('card');

    assert($card instanceof DiscoveredComponent);

    expect($card->domain)->toBe('Core');
});
