<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ColumnWidth: string
{
    case Xs = 'xs';
    case Sm = 'sm';
    case Md = 'md';
    case Lg = 'lg';
    case Xl = 'xl';
}
