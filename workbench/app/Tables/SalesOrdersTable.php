<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Lattice\Fragments\Components\Fragment;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\BadgeColumn;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\NumberColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Link;
use Workbench\App\Enums\SalesOrderStatus;
use Workbench\App\Fragments\BusinessPartnerCardFragment;
use Workbench\App\Fragments\SalesOrderLinesFragment;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;

/**
 * @extends EloquentTableDefinition<SalesOrder>
 */
#[AsTable('workbench.sales-orders')]
class SalesOrdersTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('number')->label(__('workbench.commerce.sales-orders.columns.number'))->sortable()->filterable(),
            TextColumn::make('businessPartner.name')
                ->label(__('workbench.commerce.sales-orders.columns.business-partner'))
                ->sortable()
                ->filterable()
                ->popover(fn (array $row): Fragment => Fragment::lazy(
                    BusinessPartnerCardFragment::class,
                    ['businessPartnerId' => $row['business_partner_id']],
                )),
            BadgeColumn::make('status')
                ->label(__('workbench.commerce.sales-orders.columns.status'))
                ->enum(SalesOrderStatus::class)
                ->filterable()
                ->colors(['draft' => 'gray', 'placed' => 'green', 'cancelled' => 'red']),
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

    /**
     * @param  array<string, mixed>  $row
     */
    #[\Override]
    public function rowDetail(array $row): ?Fragment
    {
        return Fragment::lazy(SalesOrderLinesFragment::class, ['orderId' => $row['id']]);
    }
}
