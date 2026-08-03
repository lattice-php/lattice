<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Values;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Enums\NumberFormatUnit;

#[TypeScript]
final class NumberFormat
{
    public string $kind = 'number';

    public string $notation = 'standard';

    public ?int $minimumFractionDigits = null;

    public ?int $maximumFractionDigits = null;

    public ?string $currency = null;

    public ?NumberFormatUnit $unit = null;

    public static function make(): self
    {
        return new self;
    }

    public static function currency(string $code): self
    {
        $format = new self;
        $format->currency = $code;

        return $format;
    }

    public function decimals(int $min, ?int $max = null): self
    {
        $this->minimumFractionDigits = $min;
        $this->maximumFractionDigits = $max ?? $min;

        return $this;
    }

    public function compact(): self
    {
        $this->notation = 'compact';

        return $this;
    }

    public function unit(NumberFormatUnit $unit): self
    {
        $this->unit = $unit;

        return $this;
    }
}
