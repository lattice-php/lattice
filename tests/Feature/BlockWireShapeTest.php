<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\TextInput;

it('serialises a block as type + label + schema', function (): void {
    $wire = json_decode(json_encode(
        Block::make('product')->label('Product line')->schema([TextInput::make('qty')])
    ), true);

    expect($wire['type'])->toBe('product')
        ->and($wire['label'])->toBe('Product line')
        ->and($wire['schema'])->toHaveCount(1)
        ->and($wire['schema'][0]['type'])->toBe('form.text-input')
        ->and($wire['schema'][0]['props']['name'])->toBe('qty');
});

it('defaults the label to a title-cased type', function (): void {
    $wire = json_decode(json_encode(Block::make('product')->schema([])), true);

    expect($wire['label'])->toBe('Product');
});
