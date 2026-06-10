<?php

declare(strict_types=1);

use Lattice\Lattice\Forms\Components\NumberInput;

it('serializes a number input', function (): void {
    $node = NumberInput::make('qty', 'Qty')->min(0)->max(100)->step(1)->toArray();

    expect($node['type'])->toBe('form.number-input')
        ->and($node['props'])->toMatchArray(['name' => 'qty', 'min' => 0, 'max' => 100, 'step' => 1]);
});

it('serializes a number input with a slider flag', function (): void {
    $node = NumberInput::make('level', 'Level')->slider()->min(0)->max(10)->toArray();

    expect($node['props'])->toMatchArray(['slider' => true, 'min' => 0, 'max' => 10]);
});
