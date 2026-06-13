<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Forms\Components\Builder;
use Lattice\Lattice\Forms\Components\Repeater;
use Lattice\Lattice\Forms\Components\TextInput;

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

    expect($wire['props']['resizableColumns'])->toBeTrue();
});
