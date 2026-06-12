<?php

use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;

it('serialises a repeater with its row-template schema and props', function (): void {
    $repeater = Repeater::make('items', 'Line items')
        ->schema([TextInput::make('name', 'Name')])
        ->minItems(1)
        ->maxItems(5)
        ->addLabel('Add line')
        ->itemLabel('Line')
        ->defaultItems(2);

    $wire = json_decode(json_encode($repeater), true);

    expect($wire['type'])->toBe('form.repeater')
        ->and($wire['props']['name'])->toBe('items')
        ->and($wire['props']['label'])->toBe('Line items')
        ->and($wire['props']['minItems'])->toBe(1)
        ->and($wire['props']['maxItems'])->toBe(5)
        ->and($wire['props']['reorderable'])->toBeTrue()
        ->and($wire['props']['addLabel'])->toBe('Add line')
        ->and($wire['props']['itemLabel'])->toBe('Line')
        ->and($wire['props']['defaultItems'])->toBe(2)
        ->and($wire['schema'])->toHaveCount(1)
        ->and($wire['schema'][0]['type'])->toBe('form.text-input')
        ->and($wire['schema'][0]['props']['name'])->toBe('name');
});

it('defaults reorderable on and defaultItems to 1', function (): void {
    $wire = json_decode(json_encode(Repeater::make('items')->schema([TextInput::make('name')])), true);

    expect($wire['props']['reorderable'])->toBeTrue()
        ->and($wire['props']['defaultItems'])->toBe(1);
});
