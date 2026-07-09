<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Enums\ColumnAlign;

it('defaults a column to start alignment', function (): void {
    expect(wire(TextColumn::make('name'))['props']['align'])->toBe('start');
});

it('lets a column override its alignment', function (): void {
    expect(wire(TextColumn::make('name')->align(ColumnAlign::Center))['props']['align'])->toBe('center');
});
