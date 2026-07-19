<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Checkbox;
use Lattice\Lattice\Support\Wire;

it('serializes the shared focus options', function (): void {
    $node = wire(Checkbox::make('terms', 'Accept terms')->autoFocus()->tabIndex(3));

    expect($node['type'])->toBe('field.checkbox')
        ->and($node['props'])->toMatchArray(['autoFocus' => true, 'tabIndex' => 3]);
});

describe('docs fixtures', function (): void {
    it('matches the checkbox example fixture', function (): void {
        assertFixtureMatches('checkbox.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Checkbox::make('newsletter', 'Subscribe to the newsletter'),
        ]))));
    });
});
