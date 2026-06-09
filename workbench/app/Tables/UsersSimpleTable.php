<?php

declare(strict_types=1);

namespace Workbench\App\Tables;

use Bambamboole\Lattice\Attributes\Table as TableAttribute;
use Bambamboole\Lattice\Tables\Enums\PaginationType;

#[TableAttribute('workbench.users.simple')]
final class UsersSimpleTable extends BaseUsersTable
{
    public function pagination(): PaginationType
    {
        return PaginationType::Simple;
    }
}
