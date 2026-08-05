<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum Gap: string
{
    case None = 'none';
    case ExtraSmall = 'xs';
    case Small = 'sm';
    case Medium = 'md';
    case Large = 'lg';
    case ExtraLarge = 'xl';
}
