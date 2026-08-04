<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ModalWidth: string
{
    case Sm = 'sm';
    case Md = 'md';
    case Lg = 'lg';
    case Xl = 'xl';
    case Xl2 = '2xl';
    case Xl3 = '3xl';
}
