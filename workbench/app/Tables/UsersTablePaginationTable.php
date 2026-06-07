<?php

declare(strict_types=1);

namespace Workbench\App\Tables;

use Bambamboole\Lattice\Attributes\Table as TableAttribute;
use Bambamboole\Lattice\Tables\PaginationType;

#[TableAttribute('workbench.users.table')]
final class UsersTablePaginationTable extends BaseUsersTable
{
    public function pagination(): PaginationType
    {
        return PaginationType::Table;
    }
}
