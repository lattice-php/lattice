<?php

declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\BadgeColumnProps;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Enums\ColumnType;

it('serializes common fields plus a typed props object', function () {
    $data = new ColumnData(
        key: 'status',
        label: 'Status',
        type: ColumnType::Badge,
        props: new BadgeColumnProps(colors: ['active' => 'green']),
    );

    expect(json_decode(json_encode($data), true))->toBe([
        'key' => 'status',
        'label' => 'Status',
        'type' => 'badge',
        'sortable' => null,
        'filter' => null,
        'columns' => null,
        'props' => ['colors' => ['active' => 'green']],
    ]);
});
