<?php

declare(strict_types=1);

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleColumn;

it('hydrates a built-in column type from the #[AsColumn] enum', function (): void {
    expect(BadgeColumn::make('status')->jsonSerialize()['type'])->toBe('column.badge');
});

it('hydrates a custom column type as its raw string', function (): void {
    expect(new SampleColumn('rating')->jsonSerialize()['type'])->toBe('column.rating');
});

it('throws when a column is missing the #[AsColumn] attribute', function (): void {
    $column = new class('x') extends Column {};

    expect(fn (): array => $column->jsonSerialize())->toThrow(LogicException::class);
});

it('carries a built-in type from the ColumnType enum', function (): void {
    $attribute = new AsColumn(ColumnType::Badge);

    expect($attribute->type)->toBe('column.badge');
});

it('prefixes a custom column type when the column namespace is omitted', function (): void {
    expect(new AsColumn('rating')->type)->toBe('column.rating')
        ->and(new AsColumn('column.rating')->type)->toBe('column.rating');
});
