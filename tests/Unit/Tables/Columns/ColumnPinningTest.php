<?php
declare(strict_types=1);

use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Enums\ColumnPin;

it('defaults to unpinned', function (): void {
    expect(wire(TextColumn::make('name'))['props'])
        ->toMatchArray(['pinned' => null]);
});

it('pins a column to the left by default', function (): void {
    expect(wire(TextColumn::make('name')->pinned())['props'])
        ->toMatchArray(['pinned' => 'left']);
});

it('pins a column to the given side', function (): void {
    expect(wire(TextColumn::make('name')->pinned(ColumnPin::Right))['props'])
        ->toMatchArray(['pinned' => 'right']);
});
