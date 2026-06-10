<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

enum ToastVariant: string
{
    case Success = 'success';
    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';
}
