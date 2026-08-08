<?php
declare(strict_types=1);

use Lattice\Table\Columns\MoneyColumn;

it('serializes a static-currency money column', function (): void {
    $data = wire(MoneyColumn::make('total')->currency('EUR'));

    expect($data['type'])->toBe('column.money')
        ->and($data['props']['align'])->toBe('end')
        ->and($data['props']['currency'])->toBe('EUR')
        ->and($data['props']['currencyField'])->toBeNull()
        ->and($data['props']['filter'] ?? null)->toBeNull();
});

it('serializes a per-row currency reference', function (): void {
    $props = wire(MoneyColumn::make('total')->currencyField('currency')->decimals(0))['props'];

    expect($props['currencyField'])->toBe('currency')
        ->and($props['currency'])->toBeNull()
        ->and($props['minimumFractionDigits'])->toBe(0);
});
