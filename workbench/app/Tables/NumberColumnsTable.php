<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\MoneyColumn;
use Lattice\Lattice\Tables\Columns\NumberColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.demo.number-columns')]
class NumberColumnsTable extends EloquentTableDefinition
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
    public function builder(TableQuery $query): Builder
    {
        $builder = Product::query()
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

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }
}
