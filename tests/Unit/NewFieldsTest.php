<?php

declare(strict_types=1);

use Bambamboole\Lattice\Components\Form\DateInput;
use Bambamboole\Lattice\Components\Form\NumberInput;
use Bambamboole\Lattice\Components\Form\Textarea;

it('serializes a textarea', function (): void {
    $node = Textarea::make('bio', 'Bio')->rows(4)->toArray();

    expect($node['type'])->toBe('form.textarea')
        ->and($node['props'])->toMatchArray(['name' => 'bio', 'label' => 'Bio', 'rows' => 4]);
});

it('serializes a number input with a slider flag', function (): void {
    $node = NumberInput::make('level', 'Level')->slider()->min(0)->max(10)->step(2)->toArray();

    expect($node['type'])->toBe('form.number-input')
        ->and($node['props'])->toMatchArray([
            'name' => 'level',
            'slider' => true,
            'min' => 0,
            'max' => 10,
            'step' => 2,
        ]);
});

it('serializes a date input', function (): void {
    $node = DateInput::make('due', 'Due date')->min('2026-01-01')->toArray();

    expect($node['type'])->toBe('form.date-input')
        ->and($node['props'])->toMatchArray(['name' => 'due', 'min' => '2026-01-01']);
});
