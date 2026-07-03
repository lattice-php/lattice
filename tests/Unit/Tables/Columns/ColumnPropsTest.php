<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\DateTimeStyle;
use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;

it('reflects a column\'s public properties into the full props shape', function (): void {
    expect(wire(TextColumn::make('name'))['props'])->toBe([
        'date' => null,
        'link' => null,
        'badge' => null,
        'multiple' => null,
        'copyable' => false,
    ]);

    $configured = wire(
        TextColumn::make('tags')->dateTime()->copyable()->link('/x', external: true)->badge('color')->multiple('name'),
    );

    expect($configured['props'])->toBe([
        'date' => ['dateStyle' => 'medium', 'timeStyle' => 'medium'],
        'link' => ['href' => '/x', 'external' => true],
        'badge' => ['colorKey' => 'color'],
        'multiple' => 'name',
        'copyable' => true,
    ]);
});

it('maps each date style method to its dateStyle/timeStyle shape', function (): void {
    expect(wire(TextColumn::make('at')->date())['props']['date'])
        ->toBe(['dateStyle' => 'medium', 'timeStyle' => null]);

    expect(wire(TextColumn::make('at')->time(DateTimeStyle::Short))['props']['date'])
        ->toBe(['dateStyle' => null, 'timeStyle' => 'short']);

    expect(wire(TextColumn::make('at')->dateTime(DateTimeStyle::Long))['props']['date'])
        ->toBe(['dateStyle' => 'long', 'timeStyle' => 'long']);
});

it('omits props for columns that expose no public properties', function (): void {
    expect(wire(BooleanColumn::make('active'))['props'])->toBeNull();
});

it('keeps protected filter and sort state off the wire props', function (): void {
    $props = wire(TextColumn::make('name')->sortable()->filterable())['props'];

    expect($props)->toBe([
        'date' => null,
        'link' => null,
        'badge' => null,
        'multiple' => null,
        'copyable' => false,
    ]);
});
