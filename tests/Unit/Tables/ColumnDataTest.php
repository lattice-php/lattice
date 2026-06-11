<?php

declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Enums\ColumnType;

it('serializes a built-in enum type with a null props bag', function () {
    $data = new ColumnData(key: 'name', label: 'Name', type: ColumnType::Text);

    $json = $data->jsonSerialize();

    expect($json['type'])->toBe('text')
        ->and($json)->toHaveKey('props')
        ->and($json['props'])->toBeNull();
});

it('accepts a custom string type and a typed props bag', function () {
    $data = new ColumnData(
        key: 'status',
        label: 'Status',
        type: 'column.status-badge',
        props: ['colors' => ['active' => 'green']],
    );

    $json = $data->jsonSerialize();

    expect($json['type'])->toBe('column.status-badge')
        ->and($json['props'])->toBe(['colors' => ['active' => 'green']]);
});
