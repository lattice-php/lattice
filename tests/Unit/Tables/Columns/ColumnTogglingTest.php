<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\StackColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;

it('is not toggleable by default', function (): void {
    expect(wire(TextColumn::make('name'))['props'])
        ->toMatchArray(['toggleable' => false, 'hiddenByDefault' => false]);
});

it('opts in to toggling', function (): void {
    expect(wire(TextColumn::make('name')->toggleable())['props'])
        ->toMatchArray(['toggleable' => true, 'hiddenByDefault' => false]);
});

it('opts in to toggling hidden by default', function (): void {
    expect(wire(TextColumn::make('name')->toggleable(hiddenByDefault: true))['props'])
        ->toMatchArray(['toggleable' => true, 'hiddenByDefault' => true]);
});

it('carries the toggle flags through a stack column', function (): void {
    $stack = StackColumn::make('summary')->toggleable(hiddenByDefault: true);

    expect(wire($stack)['props'])
        ->toMatchArray(['toggleable' => true, 'hiddenByDefault' => true]);
});
