<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum DateTimeStyle: string
{
    case Full = 'full';
    case Long = 'long';
    case Medium = 'medium';
    case Short = 'short';
}
