<?php

use Lattice\Lattice\Forms\Components\Block;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;

it('serialises a builder with its blocks and props', function (): void {
    $wire = json_decode(json_encode(
        Builder::make('items', 'Line items')
            ->blocks([
                Block::make('text')->label('Text')->schema([Textarea::make('content')]),
                Block::make('product')->label('Product line')->schema([TextInput::make('qty')]),
            ])
            ->minItems(1)
            ->maxItems(20)
            ->addLabel('Add block')
    ), true);

    expect($wire['type'])->toBe('form.builder')
        ->and($wire['props']['name'])->toBe('items')
        ->and($wire['props']['minItems'])->toBe(1)
        ->and($wire['props']['maxItems'])->toBe(20)
        ->and($wire['props']['reorderable'])->toBeTrue()
        ->and($wire['props']['addLabel'])->toBe('Add block')
        ->and($wire['blocks'])->toHaveCount(2)
        ->and($wire['blocks'][0]['type'])->toBe('text')
        ->and($wire['blocks'][1]['type'])->toBe('product')
        ->and($wire['blocks'][1]['schema'][0]['props']['name'])->toBe('qty');
});
