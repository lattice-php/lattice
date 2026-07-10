<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\TextColumn;

it('serializes a column without mutating it and yields identical output twice', function (): void {
    $column = TextColumn::make('name')->sortable();

    $first = wire($column);
    $second = wire($column);

    expect($second)->toEqual($first)
        ->and($column->sortable)->toBeFalse()
        ->and($column->filter)->toBeNull();
});
