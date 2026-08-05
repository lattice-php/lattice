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
use Workbench\App\Models\BusinessPartner;

/**
 * @extends EloquentTableDefinition<BusinessPartner>
 */
#[AsTable('workbench.business-partners')]
class BusinessPartnersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.commerce.business-partners.columns.name'))->sortable()->filterable(),
            TextColumn::make('email')->label(__('workbench.commerce.business-partners.columns.email'))->sortable()->filterable(),
            TextColumn::make('groups_count')->label(__('workbench.commerce.business-partners.columns.groups-count')),
            TextColumn::make('default_shipping_address_city')->label(__('workbench.commerce.business-partners.columns.shipping-city')),
        ];
    }

    /**
     * @return Builder<BusinessPartner>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = BusinessPartner::query()
            ->select(['id', 'name', 'email', 'default_shipping_address_id'])
            ->withCount('groups')
            ->withAggregate('defaultShippingAddress', 'city');

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
            Link::make(__('workbench.commerce.business-partners.actions.edit'), 'business-partner-edit')
                ->href('/business-partners/'.$row['id'].'/edit'),
        ];
    }
}
