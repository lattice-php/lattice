<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Toggle;

it('serializes a default boolean value', function (): void {
    $node = wire(Toggle::make('published', 'Published')->value(true));

    expect($node['props'])->toMatchArray([
        'name' => 'published',
        'label' => 'Published',
        'value' => true,
    ]);
});

describe('docs fixtures', function (): void {
    it('matches the toggle example fixture', function (): void {
        assertFixtureMatches('toggle.basic', Wire::toWire([
            Toggle::make('published', 'Published')->helperText('Show this item publicly.'),
        ]));
    });
});
