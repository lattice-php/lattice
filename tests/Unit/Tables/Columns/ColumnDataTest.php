<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Columns\BadgeColumnProps;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Enums\ColumnType;

it('serializes common fields plus a typed props object', function () {
    $data = new ColumnData(
        key: 'status',
        label: 'Status',
        type: ColumnType::Badge,
        width: ColumnWidth::Sm,
        props: new BadgeColumnProps(colors: ['active' => 'green']),
    );

    expect(wire($data))->toBe([
        'key' => 'status',
        'label' => 'Status',
        'type' => 'badge',
        'width' => 'sm',
        'sortable' => null,
        'filter' => null,
        'columns' => null,
        'props' => ['colors' => ['active' => 'green']],
    ]);
});

it('serializes the default column width', function () {
    $data = new ColumnData(
        key: 'status',
        label: 'Status',
        type: ColumnType::Text,
    );

    expect(wire($data)['width'])->toBe('md');
});
