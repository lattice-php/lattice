<?php

declare(strict_types=1);

namespace Lattice\Map;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum FeatureType: string
{
    case Marker = 'marker';
}
