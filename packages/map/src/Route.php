<?php

declare(strict_types=1);

namespace Lattice\Map;

use InvalidArgumentException;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorName;

final class Route
{
    /** @var list<CoordinateData> */
    private array $path = [];

    private ?Color $color = null;

    private ?int $weight = null;

    public readonly string $id;

    private function __construct(string $id)
    {
        $id = trim($id);

        if ($id === '') {
            throw new InvalidArgumentException('Map route id must not be empty.');
        }

        $this->id = $id;
    }

    public static function make(string $id): self
    {
        return new self($id);
    }

    /** @param list<CoordinateData|array{0: float, 1: float}> $points */
    public function path(array $points): self
    {
        $this->path = array_map(
            static fn (CoordinateData|array $point): CoordinateData => $point instanceof CoordinateData
                ? $point
                : CoordinateData::make($point[0], $point[1]),
            $points,
        );

        return $this;
    }

    public function color(Color|ColorName|string $color): self
    {
        $this->color = Color::from($color);

        return $this;
    }

    public function weight(int $weight): self
    {
        if ($weight < 1) {
            throw new InvalidArgumentException('Map route weight must be at least 1.');
        }

        $this->weight = $weight;

        return $this;
    }

    public function data(): RouteData
    {
        if (count($this->path) < 2) {
            throw new InvalidArgumentException("Map route [{$this->id}] requires at least two points.");
        }

        return new RouteData(
            type: FeatureType::Route,
            id: $this->id,
            path: $this->path,
            color: $this->color,
            weight: $this->weight,
        );
    }
}
