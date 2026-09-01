<?php

declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ContentAlign: string
{
    case Start = 'start';
    case Center = 'center';
    case End = 'end';
}
