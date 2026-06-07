<?php

declare(strict_types=1);

namespace Workbench\App\Tables;

use Bambamboole\Lattice\Attributes\Table as TableAttribute;
use Bambamboole\Lattice\Tables\Columns\TextColumn;
use Bambamboole\Lattice\Tables\EloquentTableDefinition;
use Bambamboole\Lattice\Tables\PaginationType;
use Bambamboole\Lattice\Tables\TableQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User;

/**
 * @extends EloquentTableDefinition<User>
 */
#[TableAttribute('workbench.users')]
class UsersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, TextColumn>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable()->filterable(),
            TextColumn::make('email')->label('Email')->sortable()->filterable()->link('mailto:{value}')->copyable(),
            TextColumn::make('created_at')->label('Created at')->sortable()->date('Y-m-d H:i:s'),
            TextColumn::make('updated_at')->label('Updated at')->sortable()->date('Y-m-d H:i:s'),
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

    /**
     * @return Builder<User>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = User::query()->select(['id', 'name', 'email', 'created_at', 'updated_at']);

        if ($query->sorts() === []) {
            $builder->orderBy('id');
        }

        return $builder;
    }
}
