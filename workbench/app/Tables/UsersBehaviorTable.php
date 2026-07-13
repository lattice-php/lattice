<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\TextColumn;

#[AsTable('workbench.demo.users-behavior')]
class UsersBehaviorTable extends BaseUsersTable
{
    /**
     * @return array<int, TextColumn>
     */
    #[\Override]
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable()->filterable(),
            TextColumn::make('email')->label(__('workbench.tables.columns.email'))->sortable()->filterable()->link('mailto:{value}')->copyable()->toggleable(),
            TextColumn::make('created_at')->label(__('workbench.tables.columns.created-at'))->sortable()->dateTime()->toggleable(),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->sortable()->dateTime()->toggleable(),
        ];
    }

    #[\Override]
    public function striped(): bool
    {
        return true;
    }
}
