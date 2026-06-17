<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Width: string
{
    case Full = 'full';
    case Auto = 'auto';
    case Small = 'sm';
    case Medium = 'md';
    case Large = 'lg';
    case Fill = 'fill';
}
