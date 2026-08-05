<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ButtonType: string
{
    case Button = 'button';
    case Submit = 'submit';
    case Reset = 'reset';
}
