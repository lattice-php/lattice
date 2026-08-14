<?php

declare(strict_types=1);

namespace Lattice\Map;

use BackedEnum;
use InvalidArgumentException;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorName;
use Lattice\Core\Support\Wire;
use Lattice\Ui\Components\Component;

final class Marker
{
    private ?CoordinateData $position = null;

    private string $label;

    /** @var list<Component> */
    private array $schema = [];

    private bool $open = false;

    private ?string $icon = null;

    private ?Color $color = null;

    public readonly string $id;

    private function __construct(string $id)
    {
        $id = trim($id);

        if ($id === '') {
            throw new InvalidArgumentException('Map marker id must not be empty.');
        }

        $this->id = $id;
        $this->label = $id;
    }

    public static function make(string $id): self
    {
        return new self($id);
    }

    public function position(float $latitude, float $longitude): self
    {
        $this->position = CoordinateData::make($latitude, $longitude);

        return $this;
    }

    public function label(string $label): self
    {
        $label = trim($label);

        if ($label === '') {
            throw new InvalidArgumentException('Map marker label must not be empty.');
        }

        $this->label = $label;

        return $this;
    }

    /** @param list<Component> $schema */
    public function popup(array $schema): self
    {
        $this->schema = $schema;

        return $this;
    }

    public function open(bool $open = true): self
    {
        $this->open = $open;

        return $this;
    }

    public function icon(BackedEnum|string $icon): self
    {
        $this->icon = Wire::scalar($icon);

        return $this;
    }

    public function color(Color|ColorName|string $color): self
    {
        $this->color = Color::from($color);

        return $this;
    }

    public function data(): MarkerData
    {
        if (! $this->position instanceof CoordinateData) {
            throw new InvalidArgumentException("Map marker [{$this->id}] requires a position.");
        }

        if ($this->open && $this->schema === []) {
            throw new InvalidArgumentException("Map marker [{$this->id}] cannot open without popup content.");
        }

        return new MarkerData(
            type: FeatureType::Marker,
            id: $this->id,
            position: $this->position,
            label: $this->label,
            schema: $this->schema,
            open: $this->open,
            icon: $this->icon,
            color: $this->color,
        );
    }
}
