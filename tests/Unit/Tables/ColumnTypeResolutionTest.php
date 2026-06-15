<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Tests\Fixtures\TypeScript\SampleColumn;

it('hydrates a built-in column type from the #[AsColumn] enum', function () {
    expect(BadgeColumn::make('status')->toData()->type)->toBe(ColumnType::Badge);
});

it('hydrates a custom column type as its raw string', function () {
    expect((new SampleColumn('rating'))->toData()->type)->toBe('column.rating');
});

it('throws when a column is missing the #[AsColumn] attribute', function () {
    $column = new class('x') extends Column
    {
        public function toData(): ColumnData
        {
            return new ColumnData(
                key: $this->key,
                label: 'X',
                type: $this->resolvedType(),
                width: ColumnWidth::Md,
                props: null,
            );
        }
    };

    expect(fn (): ColumnData => $column->toData())->toThrow(LogicException::class);
});
