<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Components\Table;

it('omits a column hidden via visible(false) from the serialized table', function (): void {
    $table = Table::make('t')->columns([
        TextColumn::make('name'),
        TextColumn::make('secret')->visible(false),
    ]);

    $keys = array_map(fn (array $c): string => $c['key'], array_map(
        fn ($c) => $c->jsonSerialize(),
        $table->columns,
    ));

    expect($keys)->toBe(['name']);
});

it('omits a hidden child from a stack column', function (): void {
    $wire = StackColumn::make('stack')->columns([
        TextColumn::make('shown'),
        TextColumn::make('hidden')->visible(false),
    ])->toData()->jsonSerialize();

    $childKeys = array_map(fn ($c): string => $c->key, $wire['columns']);

    expect($childKeys)->toBe(['shown']);
});
