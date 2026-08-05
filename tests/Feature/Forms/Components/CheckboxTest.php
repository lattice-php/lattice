<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Checkbox;

it('serializes the shared focus options', function (): void {
    $node = wire(Checkbox::make('terms', 'Accept terms')->autoFocus()->tabIndex(3));

    expect($node['type'])->toBe('field.checkbox')
        ->and($node['props'])->toMatchArray(['autoFocus' => true, 'tabIndex' => 3]);
});

describe('docs fixtures', function (): void {
    it('matches the checkbox example fixture', function (): void {
        assertFixtureMatches('checkbox.basic', Wire::toWire([
            Checkbox::make('newsletter', 'Subscribe to the newsletter'),
        ]));
    });
});
