<?php

declare(strict_types=1);

use Lattice\Form\Components\Choice;
use Lattice\Form\PatternInput\PatternToken;

it('compiles a token to a name + label + schema value object', function (): void {
    $wire = wire(
        PatternToken::make('NUMBER')
            ->label('Fortlaufende Nummer')
            ->configurable([Choice::make('padding')->options([4 => '4', 5 => '5'])->value(4)])
            ->data(),
    );

    expect($wire['name'])->toBe('NUMBER')
        ->and($wire['label'])->toBe('Fortlaufende Nummer')
        ->and($wire['schema'])->toHaveCount(1)
        ->and($wire['schema'][0]['type'])->toBe('field.choice')
        ->and($wire['schema'][0]['props']['name'])->toBe('padding');
});

it('defaults the label to a title-cased name', function (): void {
    $wire = wire(PatternToken::make('customer_prefix')->data());

    expect($wire['label'])->toBe('Customer Prefix');
});
