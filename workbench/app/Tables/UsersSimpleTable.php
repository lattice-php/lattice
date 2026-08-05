<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Enums\PaginationType;

#[AsTable('workbench.users.simple')]
final class UsersSimpleTable extends BaseUsersTable
{
    #[\Override]
    public function pagination(): PaginationType
    {
        return PaginationType::Simple;
    }
}
