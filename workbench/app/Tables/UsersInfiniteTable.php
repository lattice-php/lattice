<?php

declare(strict_types=1);

namespace Workbench\App\Tables;

use Lattice\Lattice\Attributes\Table as TableAttribute;
use Lattice\Lattice\Tables\Enums\PaginationType;

#[TableAttribute('workbench.users.infinite')]
final class UsersInfiniteTable extends BaseUsersTable
{
    public function pagination(): PaginationType
    {
        return PaginationType::Infinite;
    }
}
