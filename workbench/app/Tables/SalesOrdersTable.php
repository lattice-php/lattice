<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;
use Workbench\App\Tables\Columns\StatusBadgeColumn;

/**
 * @extends EloquentTableDefinition<SalesOrder>
 */
#[Table('workbench.sales-orders')]
class SalesOrdersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('number')->label(__('workbench.commerce.sales-orders.columns.number'))->sortable()->filterable(),
            TextColumn::make('business_partner_name')->label(__('workbench.commerce.sales-orders.columns.business-partner')),
            StatusBadgeColumn::make('status')
                ->label(__('workbench.commerce.sales-orders.columns.status'))
                ->filterable(Op::Equals)
                ->colorMap(['draft' => 'gray', 'placed' => 'green', 'cancelled' => 'red']),
            NumberColumn::make('total')->label(__('workbench.commerce.sales-orders.columns.total')),
        ];
    }

    /**
     * @return Builder<SalesOrder>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = SalesOrder::query()
            ->select(['id', 'business_partner_id', 'number', 'status'])
            ->withAggregate('businessPartner', 'name')
            ->selectSub(
                SalesOrderLine::query()
                    ->select(DB::raw('coalesce(sum(quantity * unit_price), 0)'))
                    ->whereColumn('sales_order_id', 'sales_orders.id'),
                'total',
            );

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
            Link::make(__('workbench.commerce.sales-orders.actions.edit'), 'sales-order-edit')
                ->href('/sales-orders/'.$row['id'].'/edit'),
        ];
    }
}
