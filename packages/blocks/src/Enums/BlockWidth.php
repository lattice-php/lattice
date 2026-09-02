<?php
declare(strict_types=1);

namespace Lattice\Blocks\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum BlockWidth: string
{
    case Content = 'content';
    case Wide = 'wide';
    case Full = 'full';
}
