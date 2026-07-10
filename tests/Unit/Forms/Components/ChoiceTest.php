<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Choice;
use Lattice\Lattice\Support\Wire;

it('serializes the shared focus options', function (): void {
    $node = wire(Choice::make('plan', 'Plan')->autoFocus()->tabIndex(2));

    expect($node['type'])->toBe('field.choice')
        ->and($node['props'])->toMatchArray(['autoFocus' => true, 'tabIndex' => 2]);
});

describe('docs fixtures', function (): void {
    it('matches the choice example fixture', function (): void {
        assertFixtureMatches('choice.basic', sortFixtureKeys(stripFixtureRefs(Wire::toWire([
            Choice::make('plan', 'Plan')->options([
                Choice::option('Free', 'free'),
                Choice::option('Pro', 'pro'),
                Choice::option('Enterprise', 'enterprise'),
            ]),
        ]))));
    });
});
