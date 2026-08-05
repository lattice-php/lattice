<?php
declare(strict_types=1);

use Lattice\Core\Support\Wire;
use Lattice\Form\Components\NumberInput;

it('serializes a number input', function (): void {
    $node = wire(NumberInput::make('qty', 'Qty')->min(0)->max(100)->step(1));

    expect($node['type'])->toBe('field.number-input')
        ->and($node['props'])->toMatchArray(['name' => 'qty', 'min' => 0, 'max' => 100, 'step' => 1]);
});

it('serializes a number input with a slider flag', function (): void {
    $node = wire(NumberInput::make('level', 'Level')->slider()->min(0)->max(10));

    expect($node['props'])->toMatchArray(['slider' => true, 'min' => 0, 'max' => 10]);
});

describe('docs fixtures', function (): void {
    it('matches the number input examples fixture', function (): void {
        assertFixtureMatches('number-input.basic', Wire::toWire([
            NumberInput::make('age', 'Age')->min(0)->max(120),
        ]));

        assertFixtureMatches('number-input.slider', Wire::toWire([
            NumberInput::make('satisfaction', 'Satisfaction')->slider()->min(0)->max(10),
        ]));
    });
});
