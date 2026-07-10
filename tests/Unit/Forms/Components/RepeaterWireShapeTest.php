<?php
declare(strict_types=1);

use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\RowAction;
use Lattice\Lattice\Forms\Components\TextInput;
use Lattice\Lattice\Forms\FormData;

it('serialises a repeater with its row-template schema and props', function (): void {
    $repeater = Repeater::make('items', 'Line items')
        ->schema([TextInput::make('name', 'Name')])
        ->minItems(1)
        ->maxItems(5)
        ->addLabel('Add line')
        ->itemLabel('Line')
        ->defaultItems(2);

    $wire = wire($repeater);

    expect($wire['type'])->toBe('field.repeater')
        ->and($wire['props']['name'])->toBe('items')
        ->and($wire['props']['label'])->toBe('Line items')
        ->and($wire['props']['minItems'])->toBe(1)
        ->and($wire['props']['maxItems'])->toBe(5)
        ->and($wire['props']['reorderable'])->toBeTrue()
        ->and($wire['props']['addLabel'])->toBe('Add line')
        ->and($wire['props']['itemLabel'])->toBe('Line')
        ->and($wire['props']['defaultItems'])->toBe(2)
        ->and($wire['schema'])->toHaveCount(1)
        ->and($wire['schema'][0]['type'])->toBe('field.text-input')
        ->and($wire['schema'][0]['props']['name'])->toBe('name');
});

it('defaults reorderable on and defaultItems to 1', function (): void {
    $wire = wire(Repeater::make('items')->schema([TextInput::make('name')]));

    expect($wire['props']['reorderable'])->toBeTrue()
        ->and($wire['props']['defaultItems'])->toBe(1);
});

it('serialises rowActions as null when none are declared', function (): void {
    $wire = wire(Repeater::make('items')->schema([TextInput::make('name')]));

    expect($wire['props']['rowActions'])->toBeNull();
});

it('serialises an explicit empty rowActions array to disable the row menu', function (): void {
    $wire = wire(Repeater::make('items')->schema([TextInput::make('name')])->rowActions([]));

    expect($wire['props']['rowActions'])->toBe([]);
});

it('serialises declared rowActions into the field props', function (): void {
    $wire = wire(
        Repeater::make('items')
            ->schema([TextInput::make('name')])
            ->rowActions([RowAction::duplicate(), RowAction::remove()->label('Delete')]),
    );

    expect($wire['props']['rowActions'])->toHaveCount(2)
        ->and($wire['props']['rowActions'][0]['type'])->toBe('duplicate')
        ->and($wire['props']['rowActions'][1]['type'])->toBe('remove')
        ->and($wire['props']['rowActions'][1]['label'])->toBe('Delete')
        ->and($wire['props']['rowActions'][1]['destructive'])->toBeTrue();
});

it('omits a rowAction hidden via visible(false) from the serialized rowActions', function (): void {
    $wire = wire(
        Repeater::make('items')
            ->schema([TextInput::make('name')])
            ->rowActions([RowAction::duplicate(), RowAction::remove()->visible(false)]),
    );

    expect($wire['props']['rowActions'])->toHaveCount(1)
        ->and($wire['props']['rowActions'][0]['type'])->toBe('duplicate');
});

it('resolves closure item labels from filled row state', function (): void {
    $wire = wire(
        Form::make('order')->fill([
            'items' => [
                ['sku' => 'A-100'],
                ['sku' => 'B-200'],
            ],
        ])->schema([
            Repeater::make('items')
                ->schema([TextInput::make('sku')])
                ->itemLabel(fn (FormData $row): string => 'SKU '.$row->string('sku')),
        ]),
    );

    expect($wire['schema'][0]['props']['itemLabel'])->toBeNull()
        ->and($wire['schema'][0]['props']['itemLabels'])->toBe(['SKU A-100', 'SKU B-200']);
});
