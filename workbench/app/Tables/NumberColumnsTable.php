<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Core\Attributes\AsTable;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\MoneyColumn;
use Lattice\Table\Columns\NumberColumn;
use Lattice\Table\Columns\TextColumn;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

#[AsTable('workbench.demo.number-columns')]
class NumberColumnsTable extends BaseProductsDemoTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable(),
            MoneyColumn::make('default_price')->label(__('workbench.tables.columns.default-price'))->sortable()->currency('EUR'),
            NumberColumn::make('prices_count')->label(__('workbench.tables.columns.prices-count'))->sortable(),
        ];
    }

    /**
     * @return Builder<Product>
     */
    protected function query(): Builder
    {
        return Product::query()
            ->select(['id', 'name'])
            ->selectSub(
                SalesPrice::query()
                    ->select('amount')
                    ->whereColumn('product_id', 'products.id')
                    ->whereNull('group_id')
                    ->limit(1),
                'default_price',
            )
            ->selectSub(
                SalesPrice::query()
                    ->selectRaw('count(*)')
                    ->whereColumn('product_id', 'products.id'),
                'prices_count',
            );
    }
}
