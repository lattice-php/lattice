<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;

/**
 * @extends EloquentTableDefinition<User>
 */
#[AsTable('workbench.users')]
class UsersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, TextColumn>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable()->filterable(),
            TextColumn::make('email')->label(__('workbench.tables.columns.email'))->sortable()->filterable()->link('mailto:{value}')->copyable(),
            TextColumn::make('created_at')->label(__('workbench.tables.columns.created-at'))->sortable()->date('Y-m-d H:i:s'),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->sortable()->date('Y-m-d H:i:s'),
        ];
    }

    #[\Override]
    public function pagination(): PaginationType
    {
        return PaginationType::Infinite;
    }

    #[\Override]
    public function perPage(): int
    {
        return 25;
    }

    #[\Override]
    public function resizableColumns(): bool
    {
        return true;
    }

    #[\Override]
    public function resizeIndicator(): bool
    {
        return true;
    }

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = User::query()->select(['id', 'name', 'email', 'created_at', 'updated_at']);

        if ($query->sorts === []) {
            $builder->orderBy('id');
        }

        return $builder;
    }
}
