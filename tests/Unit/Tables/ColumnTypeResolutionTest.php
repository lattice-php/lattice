<?php

declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Columns\Column;
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
