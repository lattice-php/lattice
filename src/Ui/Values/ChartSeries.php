<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Values;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Enums\ChartSeriesType;

#[TypeScript]
final readonly class ChartSeries
{
    public function __construct(
        public ChartSeriesType $type,
        public string $dataKey,
        public string $name,
        public ?string $color = null,
        public ?string $stackId = null,
        public ?string $nameKey = null,
        public string $innerRadius = '0%',
    ) {}

    public static function line(string $dataKey, ?string $name = null, ?string $color = null): self
    {
        return new self(ChartSeriesType::Line, $dataKey, $name ?? $dataKey, $color);
    }

    public static function bar(string $dataKey, ?string $name = null, ?string $color = null, ?string $stackId = null): self
    {
        return new self(ChartSeriesType::Bar, $dataKey, $name ?? $dataKey, $color, $stackId);
    }

    public static function area(string $dataKey, ?string $name = null, ?string $color = null, ?string $stackId = null): self
    {
        return new self(ChartSeriesType::Area, $dataKey, $name ?? $dataKey, $color, $stackId);
    }

    public static function pie(string $dataKey, ?string $nameKey = null, ?string $name = null, ?string $color = null): self
    {
        return new self(ChartSeriesType::Pie, $dataKey, $name ?? $dataKey, $color, nameKey: $nameKey);
    }

    public static function doughnut(string $dataKey, ?string $nameKey = null, ?string $name = null, ?string $color = null, string $innerRadius = '60%'): self
    {
        return new self(ChartSeriesType::Pie, $dataKey, $name ?? $dataKey, $color, nameKey: $nameKey, innerRadius: $innerRadius);
    }
}
