<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\BadgeColumnProps;
use Lattice\Lattice\Tables\Enums\ColumnType;

it('carries a built-in type from the ColumnType enum and the props class', function () {
    $attribute = new AsColumn(ColumnType::Badge, props: BadgeColumnProps::class);

    expect($attribute->type)->toBe('badge')
        ->and($attribute->props)->toBe(BadgeColumnProps::class);
});

it('accepts a raw string type for a custom column', function () {
    $attribute = new AsColumn('column.rating', props: BadgeColumnProps::class);

    expect($attribute->type)->toBe('column.rating');
});
