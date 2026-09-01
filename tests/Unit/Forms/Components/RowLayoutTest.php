<?php
declare(strict_types=1);

use Lattice\Form\Components\Builder;
use Lattice\Form\Components\Repeater;
use Lattice\Form\Components\TextInput;
use Lattice\Ui\Enums\ColumnWidth;

it('defaults to the stack layout', function (): void {
    $wire = wire(Repeater::make('items')->schema([TextInput::make('a')]));
    expect($wire['props']['layout'])->toBe('stack');
});

it('opts into the table layout via table()', function (): void {
    $repeater = wire(Repeater::make('items')->table()->schema([TextInput::make('a')]));
    $builder = wire(Builder::make('items')->table());

    expect($repeater['props']['layout'])->toBe('table')
        ->and($builder['props']['layout'])->toBe('table');
});

it('opts into the grid layout with a column count via grid()', function (): void {
    $default = wire(Repeater::make('items')->grid()->schema([TextInput::make('a')]));
    $three = wire(Repeater::make('items')->grid(3)->schema([TextInput::make('a')]));

    expect($default['props']['layout'])->toBe('grid')
        ->and($default['props']['gridColumns'])->toBe(2)
        ->and($three['props']['gridColumns'])->toBe(3);
});

it('serializes table layout column width hints on row fields', function (): void {
    $wire = wire(Repeater::make('items')->table()->schema([
        TextInput::make('qty')->columnWidth(ColumnWidth::Xs),
    ]));

    expect($wire['schema'][0]['props']['columnWidth'])->toBe('xs');
});

it('serializes default row field column widths', function (): void {
    $wire = wire(Repeater::make('items')->table()->schema([
        TextInput::make('qty'),
    ]));

    expect($wire['schema'][0]['props']['columnWidth'])->toBe('md');
});

it('serializes resizable column opt-in on row table layouts', function (): void {
    $wire = wire(Repeater::make('items')->table()->resizableColumns()->schema([
        TextInput::make('qty'),
    ]));

    expect($wire['props']['resizableColumns'])->toBeTrue()
        ->and($wire['props']['resizeIndicator'])->toBeFalse();
});

it('serializes visible resize indicators on row table layouts', function (): void {
    $wire = wire(Repeater::make('items')->table()->resizableColumns(showIndicator: true)->schema([
        TextInput::make('qty'),
    ]));

    expect($wire['props']['resizableColumns'])->toBeTrue()
        ->and($wire['props']['resizeIndicator'])->toBeTrue();
});
