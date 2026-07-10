<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Variant: string
{
    case Success = 'success';
    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';
}
