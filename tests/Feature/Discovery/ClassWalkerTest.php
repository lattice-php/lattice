<?php

declare(strict_types=1);

use Lattice\Lattice\Support\Discovery\ClassWalker;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

it('walks classes under a path and returns an empty list for a missing path', function () {
    $classes = ClassWalker::classes(dirname(__DIR__, 3).'/src/Tables/Columns');

    expect($classes)->toContain(BadgeColumn::class)
        ->and(ClassWalker::classes('/no/such/path'))->toBe([]);
});

it('includes enums via all()', function () {
    $all = ClassWalker::all(dirname(__DIR__, 3).'/src/Tables/Enums');

    expect($all)->toContain(ColumnType::class);
});
