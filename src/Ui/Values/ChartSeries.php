<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Values;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorName;
use Lattice\Lattice\Ui\Enums\ChartSeriesType;

#[TypeScript]
final readonly class ChartSeries
{
    public function __construct(
        public ChartSeriesType $type,
        public string $dataKey,
        public string $name,
        public ?Color $color = null,
        public ?string $stackId = null,
        public ?string $nameKey = null,
        public string $innerRadius = '0%',
        public ?float $maxValue = null,
    ) {}

    public static function line(string $dataKey, ?string $name = null, Color|ColorName|string|null $color = null): self
    {
        return new self(ChartSeriesType::Line, $dataKey, $name ?? $dataKey, self::resolveColor($color));
    }

    public static function bar(string $dataKey, ?string $name = null, Color|ColorName|string|null $color = null, ?string $stackId = null): self
    {
        return new self(ChartSeriesType::Bar, $dataKey, $name ?? $dataKey, self::resolveColor($color), $stackId);
    }

    public static function area(string $dataKey, ?string $name = null, Color|ColorName|string|null $color = null, ?string $stackId = null): self
    {
        return new self(ChartSeriesType::Area, $dataKey, $name ?? $dataKey, self::resolveColor($color), $stackId);
    }

    public static function pie(string $dataKey, ?string $nameKey = null, ?string $name = null, Color|ColorName|string|null $color = null): self
    {
        return new self(ChartSeriesType::Pie, $dataKey, $name ?? $dataKey, self::resolveColor($color), nameKey: $nameKey);
    }

    public static function doughnut(string $dataKey, ?string $nameKey = null, ?string $name = null, Color|ColorName|string|null $color = null, string $innerRadius = '60%'): self
    {
        return new self(ChartSeriesType::Pie, $dataKey, $name ?? $dataKey, self::resolveColor($color), nameKey: $nameKey, innerRadius: $innerRadius);
    }

    public static function gauge(string $dataKey, ?string $nameKey = null, ?string $name = null, Color|ColorName|string|null $color = null, ?float $maxValue = null, string $innerRadius = '70%'): self
    {
        return new self(ChartSeriesType::Gauge, $dataKey, $name ?? $dataKey, self::resolveColor($color), nameKey: $nameKey, innerRadius: $innerRadius, maxValue: $maxValue);
    }

    public static function distribution(string $dataKey, ?string $nameKey = null, ?string $name = null, Color|ColorName|string|null $color = null): self
    {
        return new self(ChartSeriesType::Distribution, $dataKey, $name ?? $dataKey, self::resolveColor($color), nameKey: $nameKey);
    }

    private static function resolveColor(Color|ColorName|string|null $color): ?Color
    {
        return $color === null ? null : Color::from($color);
    }
}
