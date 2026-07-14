<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;

/**
 * @extends EloquentTableDefinition<User>
 */
abstract class BaseUsersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, TextColumn>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable()->filterable()->searchable(),
            TextColumn::make('email')->label(__('workbench.tables.columns.email'))->sortable()->filterable()->searchable()->link('mailto:{value}')->copyable(),
            TextColumn::make('created_at')->label(__('workbench.tables.columns.created-at'))->sortable()->dateTime(),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->sortable()->dateTime(),
        ];
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
