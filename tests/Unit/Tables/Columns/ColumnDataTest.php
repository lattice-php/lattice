<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\ColumnWidth;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Enums\ColumnType;

it('serializes common fields plus a reflected props object', function (): void {
    $data = new ColumnData(
        key: 'status',
        label: 'Status',
        type: ColumnType::Badge,
        width: ColumnWidth::Sm,
        props: ['colors' => ['active' => 'green']],
    );

    expect(wire($data))->toBe([
        'key' => 'status',
        'label' => 'Status',
        'type' => 'column.badge',
        'width' => 'sm',
        'align' => 'start',
        'sortable' => null,
        'toggleable' => null,
        'hiddenByDefault' => null,
        'filter' => null,
        'columns' => null,
        'props' => ['colors' => ['active' => 'green']],
    ]);
});

it('serializes the toggleable and hidden-by-default flags when set', function (): void {
    $data = new ColumnData(
        key: 'notes',
        label: 'Notes',
        type: ColumnType::Text,
        toggleable: true,
        hiddenByDefault: true,
    );

    expect(wire($data))
        ->toMatchArray(['toggleable' => true, 'hiddenByDefault' => true]);
});

it('serializes the default column width', function (): void {
    $data = new ColumnData(
        key: 'status',
        label: 'Status',
        type: ColumnType::Text,
    );

    expect(wire($data)['width'])->toBe('md');
});
