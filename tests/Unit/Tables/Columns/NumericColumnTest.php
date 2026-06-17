<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Enums\FilterType;
use Lattice\Lattice\Tables\Enums\NumberFormatUnit;

it('defaults a numeric column to end alignment', function (): void {
    expect(wire(NumberColumn::make('price'))['align'])->toBe('end');
});

it('emits fixed fraction digits', function (): void {
    $props = wire(NumberColumn::make('price')->decimals(2))['props'];

    expect($props['minimumFractionDigits'])->toBe(2)
        ->and($props['maximumFractionDigits'])->toBe(2);
});

it('emits a fraction-digit range', function (): void {
    $props = wire(NumberColumn::make('price')->decimals(0, 2))['props'];

    expect($props['minimumFractionDigits'])->toBe(0)
        ->and($props['maximumFractionDigits'])->toBe(2);
});

it('filters a numeric column as a number', function (): void {
    $data = wire(NumberColumn::make('price')->filterable());

    expect($data['filter']['type'])->toBe(FilterType::Number->value);
});

it('emits the Intl unit as its backed value', function (): void {
    $props = wire(
        NumberColumn::make('progress')
            ->unit(NumberFormatUnit::Percent),
    )['props'];

    expect($props['unit'])->toBe('percent');
});
