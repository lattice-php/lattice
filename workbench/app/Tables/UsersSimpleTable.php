<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Enums\PaginationType;

#[AsTable('workbench.users.simple')]
final class UsersSimpleTable extends BaseUsersTable
{
    #[\Override]
    public function pagination(): PaginationType
    {
        return PaginationType::Simple;
    }
}
