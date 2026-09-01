<?php

declare(strict_types=1);

use Lattice\Form\Components\Choice;
use Lattice\Form\Components\PatternInput;
use Lattice\Form\PatternInput\PatternToken;

it('serializes tokens inside props and echoes the separator', function (): void {
    $field = PatternInput::make('pattern')
        ->tokens([
            PatternToken::make('NUMBER')
                ->label('Number')
                ->configurable([Choice::make('padding')->options([4 => '4', 5 => '5'])->value(4)]),
            PatternToken::make('YYYY')->label('Year'),
        ])
        ->separator('-');

    $wire = wire($field);

    expect($wire['type'])->toBe('field.pattern-input')
        ->and($wire['props']['name'])->toBe('pattern')
        ->and($wire['props']['separator'])->toBe('-')
        ->and($wire['props']['multiline'])->toBeFalse()
        ->and($wire['props']['rows'])->toBeNull()
        ->and($wire['props']['tokens'])->toHaveCount(2)
        ->and($wire['props']['tokens'][0]['name'])->toBe('NUMBER')
        ->and($wire['props']['tokens'][0]['schema'][0]['props']['name'])->toBe('padding')
        ->and($wire['props']['tokens'][1]['name'])->toBe('YYYY');
});

it('serializes the multiline flag and row count', function (): void {
    $wire = wire(PatternInput::make('pattern')->multiline()->rows(5));

    expect($wire['props']['multiline'])->toBeTrue()
        ->and($wire['props']['rows'])->toBe(5);
});
