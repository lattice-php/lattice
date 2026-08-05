<?php
declare(strict_types=1);

namespace Lattice\Core\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum PageContainer: string
{
    case Centered = 'centered';
    case Default = 'default';
}
