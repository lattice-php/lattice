<?php
declare(strict_types=1);

use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\StackColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\Table;
use Lattice\Ui\Components\Text;

it('omits a column hidden via visible(false) from the serialized table', function (): void {
    $table = Table::make('t')->columns([
        TextColumn::make('name'),
        TextColumn::make('secret')->visible(false),
    ]);

    $keys = array_map(fn (Column $c): string => wire($c)['key'], $table->columns);

    expect($keys)->toBe(['name']);
});

it('omits a hidden child from a stack column', function (): void {
    $wire = wire(StackColumn::make('stack')->schema([
        Text::make('Shown', 'shown'),
        Text::make('Hidden', 'hidden')->hidden(),
    ]));

    $childKeys = array_map(fn (array $c): string => $c['key'], $wire['schema']);

    expect($childKeys)->toBe(['shown']);
});
