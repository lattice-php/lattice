<?php
declare(strict_types=1);

use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Lattice\Lattice\Support\TypeScript\DiscoveredComponent;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleColumn;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleUnattributed;

it('discovers attributed components under a path with type, flags and category', function (): void {
    $discovered = (new ComponentDiscovery)->discover(__DIR__.'/../../Fixtures/TypeScript');

    $byType = collect($discovered)->keyBy->type;

    expect($byType)->toHaveKey('sample.widget')->toHaveKey('field.sample');

    $widget = $byType->get('sample.widget');
    $field = $byType->get('field.sample');

    assert($widget instanceof DiscoveredComponent);
    assert($field instanceof DiscoveredComponent);

    expect($widget->container)->toBeTrue()
        ->and($widget->category)->toBe('component')
        ->and($field->category)->toBe('component');
});

it('excludes classes without the AsComponent attribute from discovery', function (): void {
    $discovered = (new ComponentDiscovery)->discover(__DIR__.'/../../Fixtures/TypeScript');

    $types = collect($discovered)->pluck('type')->all();

    expect($types)->not->toContain('SampleUnattributed');

    $classes = collect($discovered)->pluck('class')->all();
    expect($classes)->not->toContain(SampleUnattributed::class);
});

it('returns an empty array when the path does not exist', function (): void {
    $discovered = (new ComponentDiscovery)->discover(__DIR__.'/../../Fixtures/TypeScript/does-not-exist');

    expect($discovered)->toBe([]);
});

it('derives the domain from the namespace segment before Components', function (): void {
    $discovered = (new ComponentDiscovery)->discover(dirname(__DIR__, 3).'/src/Core/Components');

    $card = collect($discovered)->keyBy->type->get('card');

    assert($card instanceof DiscoveredComponent);

    expect($card->domain)->toBe('Core');
});

it('discovers columns via attribute inheritance and captures the column class', function (): void {
    $discovered = (new ComponentDiscovery)->discover(__DIR__.'/../../Fixtures/TypeScript');

    $column = collect($discovered)->keyBy->type->get('column.rating');

    assert($column instanceof DiscoveredComponent);

    expect($column->category)->toBe('column')
        ->and($column->class)->toBe(SampleColumn::class);
});
