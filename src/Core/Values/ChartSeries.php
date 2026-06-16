<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\ChartSeriesType;

#[TypeScript]
final readonly class ChartSeries implements JsonSerializable
{
    public function __construct(
        public ChartSeriesType $type,
        public string $dataKey,
        public ?string $name = null,
        public ?string $color = null,
        public ?string $stackId = null,
        public ?string $nameKey = null,
    ) {}

    public static function line(string $dataKey, ?string $name = null, ?string $color = null): self
    {
        return new self(ChartSeriesType::Line, $dataKey, $name, $color);
    }

    public static function bar(string $dataKey, ?string $name = null, ?string $color = null, ?string $stackId = null): self
    {
        return new self(ChartSeriesType::Bar, $dataKey, $name, $color, $stackId);
    }

    public static function area(string $dataKey, ?string $name = null, ?string $color = null, ?string $stackId = null): self
    {
        return new self(ChartSeriesType::Area, $dataKey, $name, $color, $stackId);
    }

    public static function pie(string $dataKey, ?string $nameKey = null, ?string $name = null, ?string $color = null): self
    {
        return new self(ChartSeriesType::Pie, $dataKey, $name, $color, nameKey: $nameKey);
    }

    /**
     * @return array{type: string, dataKey: string, name: string|null, color: string|null, stackId: string|null, nameKey: string|null}
     */
    public function jsonSerialize(): array
    {
        return [
            'type' => $this->type->value,
            'dataKey' => $this->dataKey,
            'name' => $this->name,
            'color' => $this->color,
            'stackId' => $this->stackId,
            'nameKey' => $this->nameKey,
        ];
    }
}
