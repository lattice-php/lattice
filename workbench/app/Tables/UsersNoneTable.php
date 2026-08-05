<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Lattice\Core\Attributes\AsTable;
use Lattice\Table\Enums\PaginationType;
use Lattice\Table\TableQuery;

#[AsTable('workbench.users.none')]
final class UsersNoneTable extends BaseUsersTable
{
    #[\Override]
    public function pagination(): PaginationType
    {
        return PaginationType::None;
    }

    /**
     * @return Builder<User>
     */
    #[\Override]
    public function builder(TableQuery $query): Builder
    {
        return parent::builder($query)->limit(12);
    }
}
