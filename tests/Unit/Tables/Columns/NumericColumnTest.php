<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Enums\FilterType;

it('defaults a numeric column to end alignment', function () {
    expect(wire(NumberColumn::make('price'))['align'])->toBe('end');
});

it('emits fixed fraction digits', function () {
    $props = wire(NumberColumn::make('price')->decimals(2))['props'];

    expect($props['minimumFractionDigits'])->toBe(2)
        ->and($props['maximumFractionDigits'])->toBe(2);
});

it('emits a fraction-digit range', function () {
    $props = wire(NumberColumn::make('price')->decimals(0, 2))['props'];

    expect($props['minimumFractionDigits'])->toBe(0)
        ->and($props['maximumFractionDigits'])->toBe(2);
});

it('filters a numeric column as a number', function () {
    $data = wire(NumberColumn::make('price')->filterable());

    expect($data['filter']['type'])->toBe(FilterType::Number->value);
});
