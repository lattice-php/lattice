<?php
declare(strict_types=1);

use Lattice\Lattice\Core\Enums\DateTimeStyle;
use Lattice\Lattice\Core\Values\DateFormat;

it('serializes date, time and dateTime formats', function (): void {
    expect(DateFormat::date(DateTimeStyle::Short)->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => 'short', 'timeStyle' => null]);

    expect(DateFormat::time(DateTimeStyle::Medium)->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => null, 'timeStyle' => 'medium']);

    expect(DateFormat::dateTime(DateTimeStyle::Long)->jsonSerialize())
        ->toBe(['kind' => 'date', 'dateStyle' => 'long', 'timeStyle' => 'long']);
});
