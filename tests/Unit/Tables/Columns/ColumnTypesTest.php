<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\Icon;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\IconColumn;
use Lattice\Lattice\Tables\Columns\ImageColumn;
use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Enums\FilterType;

it('serializes a badge column with its colour map', function (): void {
    $data = wire(
        BadgeColumn::make('status')->label('Status')->sortable()->filterable()
            ->colors(['active' => 'green', 'archived' => 'red']),
    );

    expect($data['type'])->toBe('column.badge')
        ->and($data['sortable'])->toBeTrue()
        ->and($data['filter']['enabled'])->toBeTrue()
        ->and($data['props']['colors'])->toBe(['active' => 'green', 'archived' => 'red']);
});

it('serializes an icon column with a value map and colours', function (): void {
    $data = wire(
        IconColumn::make('verified')->label('Verified')
            ->icons(['1' => Icon::Check, '0' => Icon::X])
            ->colors(['1' => 'green', '0' => 'gray']),
    );

    expect($data['type'])->toBe('column.icon')
        ->and($data['props']['icons'])->toBe(['1' => 'check', '0' => 'x'])
        ->and($data['props']['colors'])->toBe(['1' => 'green', '0' => 'gray']);
});

it('serializes a static icon column', function (): void {
    $data = wire(IconColumn::make('link')->icon(Icon::ExternalLink));

    expect($data['type'])->toBe('column.icon')
        ->and($data['props']['icon'])->toBe('external-link');
});

it('serializes an image column', function (): void {
    $data = wire(ImageColumn::make('avatar')->label('Avatar')->circular()->size(40));

    expect($data['type'])->toBe('column.image')
        ->and($data['props'])->toBe(['circular' => true, 'size' => 40]);
});

it('serializes a boolean column with a boolean filter and no props', function (): void {
    $data = wire(BooleanColumn::make('featured')->label('Featured')->filterable());

    expect($data['type'])->toBe('column.boolean')
        ->and($data['props'])->toBeNull()
        ->and($data['filter']['type'])->toBe(FilterType::Boolean->value);
});

it('serializes a number column with a number filter and end alignment', function (): void {
    $data = wire(NumberColumn::make('price')->label('Price')->sortable()->filterable());

    expect($data['type'])->toBe('column.number')
        ->and($data['align'])->toBe('end')
        ->and($data['sortable'])->toBeTrue()
        ->and($data['filter']['type'])->toBe(FilterType::Number->value);
});
