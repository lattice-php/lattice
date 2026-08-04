<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum PageContainer: string
{
    case Centered = 'centered';
    case Default = 'default';
}
