<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Color: string
{
    case Default = 'default';
    case Muted = 'muted';
    case Primary = 'primary';
    case Success = 'success';
    case Info = 'info';
    case Warning = 'warning';
    case Danger = 'danger';
}
