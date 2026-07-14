<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\TextColumn;

it('is not searchable by default', function (): void {
    expect(TextColumn::make('name')->isSearchable())->toBeFalse();
});

it('opts into search with searchable()', function (): void {
    expect(TextColumn::make('name')->searchable()->isSearchable())->toBeTrue()
        ->and(TextColumn::make('name')->searchable(false)->isSearchable())->toBeFalse();
});

it('keeps the searchable flag off the wire props', function (): void {
    $props = wire(TextColumn::make('name')->searchable())['props'];

    expect($props)->not->toHaveKey('searchable')
        ->and($props)->not->toHaveKey('searchableEnabled');
});
