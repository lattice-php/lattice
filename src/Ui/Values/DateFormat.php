<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Values;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Enums\DateTimeStyle;

#[TypeScript]
final class DateFormat
{
    public string $kind = 'date';

    public ?DateTimeStyle $dateStyle = null;

    public ?DateTimeStyle $timeStyle = null;

    public ?string $month = null;

    public ?string $year = null;

    public static function date(DateTimeStyle $style = DateTimeStyle::Medium): self
    {
        $format = new self;
        $format->dateStyle = $style;

        return $format;
    }

    public static function month(bool $long = false): self
    {
        $format = new self;
        $format->month = $long ? 'long' : 'short';

        return $format;
    }

    public static function monthYear(bool $long = false): self
    {
        $format = new self;
        $format->month = $long ? 'long' : 'short';
        $format->year = 'numeric';

        return $format;
    }

    public static function time(DateTimeStyle $style = DateTimeStyle::Medium): self
    {
        $format = new self;
        $format->timeStyle = $style;

        return $format;
    }

    public static function dateTime(DateTimeStyle $style = DateTimeStyle::Medium): self
    {
        $format = new self;
        $format->dateStyle = $style;
        $format->timeStyle = $style;

        return $format;
    }
}
