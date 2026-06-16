<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Group;

/**
 * @extends EloquentTableDefinition<Group>
 */
#[Table('workbench.groups')]
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
