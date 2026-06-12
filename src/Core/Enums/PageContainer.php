<?php

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum PageContainer: string
{
    case Centered = 'centered';
    case Default = 'default';
}
