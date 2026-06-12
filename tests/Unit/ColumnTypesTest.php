<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Enums\LucideIcon;
use Lattice\Lattice\Tables\Columns\BadgeColumn;
use Lattice\Lattice\Tables\Columns\IconColumn;
use Lattice\Lattice\Tables\Columns\ImageColumn;

it('serializes a badge column with its colour map', function (): void {
    $data = wire(
        BadgeColumn::make('status')->label('Status')->sortable()->filterable()
            ->colors(['active' => 'green', 'archived' => 'red']),
    );

    expect($data['type'])->toBe('badge')
        ->and($data['sortable'])->toBeTrue()
        ->and($data['filter']['enabled'])->toBeTrue()
        ->and($data['props']['colors'])->toBe(['active' => 'green', 'archived' => 'red']);
});

it('serializes an icon column with a value map and colours', function (): void {
    $data = wire(
        IconColumn::make('verified')->label('Verified')
            ->icons(['1' => LucideIcon::Check, '0' => LucideIcon::X])
            ->colors(['1' => 'green', '0' => 'gray']),
    );

    expect($data['type'])->toBe('icon')
        ->and($data['props']['icons'])->toBe(['1' => 'check', '0' => 'x'])
        ->and($data['props']['colors'])->toBe(['1' => 'green', '0' => 'gray']);
});

it('serializes a static icon column', function (): void {
    $data = wire(IconColumn::make('link')->icon(LucideIcon::ExternalLink));

    expect($data['type'])->toBe('icon')
        ->and($data['props']['icon'])->toBe('external-link');
});

it('serializes an image column', function (): void {
    $data = wire(ImageColumn::make('avatar')->label('Avatar')->circular()->size(40));

    expect($data['type'])->toBe('image')
        ->and($data['props']['circular'])->toBeTrue()
        ->and($data['props']['size'])->toBe('40');
});
