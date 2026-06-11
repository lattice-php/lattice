<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\NumberInput;

it('serializes a number input', function (): void {
    $node = wire(NumberInput::make('qty', 'Qty')->min(0)->max(100)->step(1));

    expect($node['type'])->toBe('form.number-input')
        ->and($node['props'])->toMatchArray(['name' => 'qty', 'min' => 0, 'max' => 100, 'step' => 1]);
});

it('serializes a number input with a slider flag', function (): void {
    $node = wire(NumberInput::make('level', 'Level')->slider()->min(0)->max(10));

    expect($node['props'])->toMatchArray(['slider' => true, 'min' => 0, 'max' => 10]);
});

describe('docs fixtures', function (): void {
    it('dumps the number input examples', function (): void {
        dumpFixture('number-input.basic', [
            NumberInput::make('age', 'Age')->min(0)->max(120),
        ]);

        dumpFixture('number-input.slider', [
            NumberInput::make('satisfaction', 'Satisfaction')->slider()->min(0)->max(10),
        ]);

        expect('docs/fixtures/number-input.basic.json')->toBeReadableFile()
            ->and('docs/fixtures/number-input.slider.json')->toBeReadableFile();
    });
});
