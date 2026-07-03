<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\NumberFormatUnit;
use Lattice\Lattice\Core\Values\NumberFormat;

it('serializes a compact currency format', function (): void {
    expect(NumberFormat::currency('USD')->compact()->jsonSerialize())->toBe([
        'kind' => 'number',
        'notation' => 'compact',
        'minimumFractionDigits' => null,
        'maximumFractionDigits' => null,
        'currency' => 'USD',
        'unit' => null,
    ]);
});

it('defaults decimals max to min and serializes a unit', function (): void {
    expect(NumberFormat::make()->decimals(2)->unit(NumberFormatUnit::Percent)->jsonSerialize())->toBe([
        'kind' => 'number',
        'notation' => 'standard',
        'minimumFractionDigits' => 2,
        'maximumFractionDigits' => 2,
        'currency' => null,
        'unit' => 'percent',
    ]);
});
