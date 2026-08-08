<?php
declare(strict_types=1);

use Lattice\Table\Columns\NumberColumn;
use Lattice\Ui\Enums\NumberFormatUnit;

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

it('emits the Intl unit as its backed value', function (): void {
    $props = wire(
        NumberColumn::make('progress')
            ->unit(NumberFormatUnit::Percent),
    )['props'];

    expect($props['unit'])->toBe('percent');
});
