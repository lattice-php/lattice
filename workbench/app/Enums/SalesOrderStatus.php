<?php
declare(strict_types=1);

namespace Workbench\App\Enums;

enum SalesOrderStatus: string
{
    case Draft = 'draft';
    case Placed = 'placed';
    case Cancelled = 'cancelled';
}
