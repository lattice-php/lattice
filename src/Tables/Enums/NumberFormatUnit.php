<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Attributes\TypeScript;

/**
 * The subset of Intl.NumberFormat sanctioned units Lattice exposes. Backed
 * values are the exact Intl unit identifiers the client passes through.
 */
#[TypeScript]
enum NumberFormatUnit: string
{
    case Percent = 'percent';
    case Kilogram = 'kilogram';
    case Gram = 'gram';
    case Kilometer = 'kilometer';
    case Meter = 'meter';
    case Byte = 'byte';
    case Kilobyte = 'kilobyte';
    case Megabyte = 'megabyte';
    case Gigabyte = 'gigabyte';
    case Millisecond = 'millisecond';
    case Second = 'second';
    case Minute = 'minute';
    case Hour = 'hour';
    case Celsius = 'celsius';
    case Fahrenheit = 'fahrenheit';
}
