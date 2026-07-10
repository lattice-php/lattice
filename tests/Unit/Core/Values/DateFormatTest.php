<?php
declare(strict_types=1);

use Lattice\Lattice\Ui\Enums\DateTimeStyle;
use Lattice\Lattice\Ui\Values\DateFormat;

it('serializes date, time and dateTime formats', function (): void {
    expect(wire(DateFormat::date(DateTimeStyle::Short)))
        ->toBe(['kind' => 'date', 'dateStyle' => 'short', 'timeStyle' => null, 'month' => null, 'year' => null]);

    expect(wire(DateFormat::time(DateTimeStyle::Medium)))
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => 'medium', 'month' => null, 'year' => null]);

    expect(wire(DateFormat::dateTime(DateTimeStyle::Long)))
        ->toBe(['kind' => 'date', 'dateStyle' => 'long', 'timeStyle' => 'long', 'month' => null, 'year' => null]);
});

it('serializes month and monthYear formats with Intl field options', function (): void {
    expect(wire(DateFormat::month()))
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => null, 'month' => 'short', 'year' => null]);

    expect(wire(DateFormat::month(long: true)))
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => null, 'month' => 'long', 'year' => null]);

    expect(wire(DateFormat::monthYear()))
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => null, 'month' => 'short', 'year' => 'numeric']);
});
