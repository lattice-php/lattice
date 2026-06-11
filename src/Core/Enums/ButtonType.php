<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

enum ButtonType: string
{
    case Button = 'button';
    case Submit = 'submit';
    case Reset = 'reset';
}
