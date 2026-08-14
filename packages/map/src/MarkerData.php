<?php

declare(strict_types=1);

namespace Lattice\Map;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Core\Color;
use Lattice\Ui\Components\Component;

#[TypeScript]
final readonly class MarkerData
{
    /** @param list<Component> $schema */
    public function __construct(
        public FeatureType $type,
        public string $id,
        public CoordinateData $position,
        public string $label,
        public array $schema,
        public bool $open,
        public ?string $icon = null,
        public ?Color $color = null,
    ) {}
}
