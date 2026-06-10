<?php

declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Lattice\Lattice\Attributes\Table as TableAttribute;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\TableQuery;

#[TableAttribute('workbench.users.none')]
final class UsersNoneTable extends BaseUsersTable
{
    public function pagination(): PaginationType
    {
        return PaginationType::None;
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        return parent::builder($query)->limit(12);
    }
}
