<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\TableQuery;

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
