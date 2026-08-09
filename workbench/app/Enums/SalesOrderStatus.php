<?php
declare(strict_types=1);

namespace Workbench\App\Enums;

use Lattice\Core\Contracts\HasLabel;

enum SalesOrderStatus: string implements HasLabel
{
    case Draft = 'draft';
    case Placed = 'placed';
    case Cancelled = 'cancelled';

    public function getLabel(): string
    {
        return __('workbench.commerce.sales-orders.status.'.$this->value);
    }
}
