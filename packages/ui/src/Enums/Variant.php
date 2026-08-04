<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Variant: string
{
    case Primary = 'primary';
    case Secondary = 'secondary';
    case Success = 'success';
    case Info = 'info';
    case Warning = 'warning';
    case Danger = 'danger';
}
