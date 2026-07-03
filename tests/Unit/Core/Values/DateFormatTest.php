<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\DateTimeStyle;
use Lattice\Lattice\Core\Values\DateFormat;

it('serializes date, time and dateTime formats', function (): void {
    expect(DateFormat::date(DateTimeStyle::Short)->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => 'short', 'timeStyle' => null, 'month' => null, 'year' => null]);

    expect(DateFormat::time(DateTimeStyle::Medium)->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => 'medium', 'month' => null, 'year' => null]);

    expect(DateFormat::dateTime(DateTimeStyle::Long)->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => 'long', 'timeStyle' => 'long', 'month' => null, 'year' => null]);
});

it('serializes month and monthYear formats with Intl field options', function (): void {
    expect(DateFormat::month()->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => null, 'month' => 'short', 'year' => null]);

    expect(DateFormat::month(long: true)->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => null, 'month' => 'long', 'year' => null]);

    expect(DateFormat::monthYear()->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => null, 'month' => 'short', 'year' => 'numeric']);
});
