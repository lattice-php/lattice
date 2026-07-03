<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\DateTimeStyle;

#[TypeScript]
final class DateFormat implements JsonSerializable
{
    public string $kind = 'date';

    public ?string $dateStyle = null;

    public ?string $timeStyle = null;

    public static function date(DateTimeStyle $style = DateTimeStyle::Medium): self
    {
        $format = new self;
        $format->dateStyle = $style->value;

        return $format;
    }

    public static function time(DateTimeStyle $style = DateTimeStyle::Medium): self
    {
        $format = new self;
        $format->timeStyle = $style->value;

        return $format;
    }

    public static function dateTime(DateTimeStyle $style = DateTimeStyle::Medium): self
    {
        $format = new self;
        $format->dateStyle = $style->value;
        $format->timeStyle = $style->value;

        return $format;
    }

    /**
     * @return array{kind: string, dateStyle: string|null, timeStyle: string|null}
     */
    public function jsonSerialize(): array
    {
        return [
            'kind' => $this->kind,
            'dateStyle' => $this->dateStyle,
            'timeStyle' => $this->timeStyle,
        ];
    }
}
