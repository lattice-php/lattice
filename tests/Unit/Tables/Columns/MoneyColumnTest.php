<?php
declare(strict_types=1);

use Lattice\Lattice\Tables\Columns\MoneyColumn;
use Lattice\Lattice\Tables\Enums\FilterType;

it('serializes a static-currency money column', function () {
    $data = wire(MoneyColumn::make('total')->currency('EUR'));

    expect($data['type'])->toBe('column.money')
        ->and($data['align'])->toBe('end')
        ->and($data['props']['currency'])->toBe('EUR')
        ->and($data['props']['currencyField'])->toBeNull()
        ->and($data['filter'] ?? null)->toBeNull();
});

it('serializes a per-row currency reference', function () {
    $props = wire(MoneyColumn::make('total')->currencyField('currency')->decimals(0))['props'];

    expect($props['currencyField'])->toBe('currency')
        ->and($props['currency'])->toBeNull()
        ->and($props['minimumFractionDigits'])->toBe(0);
});

it('filters money as a number', function () {
    $data = wire(MoneyColumn::make('total')->filterable());

    expect($data['filter']['type'])->toBe(FilterType::Number->value);
});
