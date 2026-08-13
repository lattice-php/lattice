<?php

declare(strict_types=1);

namespace Lattice\Map;

use InvalidArgumentException;
use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class CoordinateData
{
    public function __construct(
        public float $latitude,
        public float $longitude,
    ) {
        if (! is_finite($this->latitude) || $this->latitude < -90 || $this->latitude > 90) {
            throw new InvalidArgumentException('Latitude must be between -90 and 90.');
        }

        if (! is_finite($this->longitude) || $this->longitude < -180 || $this->longitude > 180) {
            throw new InvalidArgumentException('Longitude must be between -180 and 180.');
        }
    }

    public static function make(float $latitude, float $longitude): self
    {
        return new self($latitude, $longitude);
    }
}
