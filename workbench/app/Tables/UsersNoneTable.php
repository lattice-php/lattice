<?php

declare(strict_types=1);

namespace Workbench\App\Tables;

use Bambamboole\Lattice\Attributes\Table as TableAttribute;
use Bambamboole\Lattice\Tables\Enums\PaginationType;
use Bambamboole\Lattice\Tables\TableQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;

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
