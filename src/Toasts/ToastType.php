<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Toasts;

enum ToastType: string
{
    case Success = 'success';
    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';
}
