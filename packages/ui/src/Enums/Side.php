<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum Side: string
{
    case Start = 'start';
    case End = 'end';
}
