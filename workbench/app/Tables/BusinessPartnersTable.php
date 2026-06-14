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
use Workbench\App\Models\BusinessPartner;

/**
 * @extends EloquentTableDefinition<BusinessPartner>
 */
#[Table('workbench.business-partners')]
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
    public function actions(array $row): array
    {
        return [
            Link::make(__('workbench.commerce.business-partners.actions.edit'), 'business-partner-edit')
                ->href('/business-partners/'.$row['id'].'/edit'),
        ];
    }
}
