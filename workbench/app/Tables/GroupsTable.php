<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Link;
use Workbench\App\Models\Group;

/**
 * @extends EloquentTableDefinition<Group>
 */
#[AsTable('workbench.groups')]
class GroupsTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.commerce.groups.columns.name'))->sortable()->filterable(),
            TextColumn::make('business_partners_count')->label(__('workbench.commerce.groups.columns.partners-count')),
        ];
    }

    /**
     * @return Builder<Group>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Group::query()
            ->select(['id', 'name'])
            ->withCount('businessPartners');

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Component>
     */
    #[\Override]
    public function actions(array $row): array
    {
        return [
            Link::make(__('workbench.commerce.groups.actions.edit'), 'group-edit')
                ->href('/groups/'.$row['id'].'/edit'),
        ];
    }
}
