<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

it('carries a built-in type from the ColumnType enum', function () {
    $attribute = new AsColumn(ColumnType::Badge);

    expect($attribute->type)->toBe('column.badge');
});

it('accepts a raw string type for a custom column', function () {
    $attribute = new AsColumn('column.rating');

    expect($attribute->type)->toBe('column.rating');
});

it('prefixes a custom column type when the column namespace is omitted', function () {
    $attribute = new AsColumn('rating');

    expect($attribute->type)->toBe('column.rating');
});
