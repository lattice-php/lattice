<?php

declare(strict_types=1);

namespace Lattice\Map;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Color;

#[TypeScript]
final readonly class RouteData
{
    /** @param list<CoordinateData> $path */
    public function __construct(
        public FeatureType $type,
        public string $id,
        public array $path,
        public ?Color $color = null,
        public ?int $weight = null,
    ) {}
}
