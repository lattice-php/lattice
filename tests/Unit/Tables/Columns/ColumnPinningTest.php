<?php
declare(strict_types=1);

use Lattice\Table\Columns\TextColumn;
use Lattice\Ui\Enums\Side;

it('defaults to unpinned', function (): void {
    expect(wire(TextColumn::make('name'))['props'])
        ->toMatchArray(['pinned' => null]);
});

it('pins a column to the start by default', function (): void {
    expect(wire(TextColumn::make('name')->pinned())['props'])
        ->toMatchArray(['pinned' => 'start']);
});

it('pins a column to the given side', function (): void {
    expect(wire(TextColumn::make('name')->pinned(Side::End))['props'])
        ->toMatchArray(['pinned' => 'end']);
});
