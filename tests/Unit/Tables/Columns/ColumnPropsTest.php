<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;

it('reflects a column\'s public properties into the full props shape', function (): void {
    expect(wire(TextColumn::make('name'))['props'])->toBe([
        'date' => null,
        'copyable' => false,
        'link' => null,
        'badge' => null,
        'multiple' => null,
    ]);

    $configured = wire(
        TextColumn::make('tags')->dateTime()->copyable()->link('/x', external: true)->badge('color')->multiple('name'),
    );

    expect($configured['props'])->toBe([
        'date' => ['dateStyle' => 'medium', 'timeStyle' => 'medium'],
        'copyable' => true,
        'link' => ['href' => '/x', 'external' => true],
        'badge' => ['colorKey' => 'color'],
        'multiple' => 'name',
    ]);
});

it('omits props for columns that expose no public properties', function (): void {
    expect(wire(BooleanColumn::make('active'))['props'])->toBeNull();
});

it('keeps protected filter and sort state off the wire props', function (): void {
    $props = wire(TextColumn::make('name')->sortable()->filterable())['props'];

    expect($props)->toBe([
        'date' => null,
        'copyable' => false,
        'link' => null,
        'badge' => null,
        'multiple' => null,
    ]);
});
