<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\RowTemplate;
use Lattice\Lattice\Forms\Components\Textarea;
use Lattice\Lattice\Forms\Components\TextInput;

it('serialises a builder with its blocks and props', function (): void {
    $wire = wire(
        Builder::make('items', 'Line items')
            ->templates([
                RowTemplate::make('text')->label('Text')->schema([Textarea::make('content')]),
                RowTemplate::make('product')->label('Product line')->schema([TextInput::make('qty')]),
            ])
            ->minItems(1)
            ->maxItems(20)
            ->addLabel('Add block')
    );

    expect($wire['type'])->toBe('field.builder')
        ->and($wire['props']['name'])->toBe('items')
        ->and($wire['props']['minItems'])->toBe(1)
        ->and($wire['props']['maxItems'])->toBe(20)
        ->and($wire['props']['reorderable'])->toBeTrue()
        ->and($wire['props']['addLabel'])->toBe('Add block')
        ->and($wire['templates'])->toHaveCount(2)
        ->and($wire['templates'][0]['type'])->toBe('text')
        ->and($wire['templates'][1]['type'])->toBe('product')
        ->and($wire['templates'][1]['schema'][0]['props']['name'])->toBe('qty');
});

it('configures default rows with the same fluent api as repeater', function (): void {
    $wire = wire(
        Builder::make('items')
            ->templates([RowTemplate::make('product')->label('Product')->schema([TextInput::make('qty')])])
            ->defaultItems(2),
    );

    expect($wire['props']['defaultItems'])->toBe(2);
});
