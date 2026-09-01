<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\BooleanColumn;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\MoneyColumn;
use Lattice\Table\Columns\NumberColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Components\Link;
use Lattice\Ui\Enums\ColumnWidth;
use Lattice\Ui\Enums\Side;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;
use Workbench\App\Tables\Columns\StatusBadgeColumn;

#[AsTable('workbench.demo.pinned-columns')]
class PinnedColumnsTable extends BaseProductsDemoTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->pinned()->sortable()->filterable(),
            TextColumn::make('sku')->label(__('workbench.tables.columns.sku'))->width(ColumnWidth::Lg)->copyable()->toggleable(),
            MoneyColumn::make('default_price')->label(__('workbench.tables.columns.default-price'))->width(ColumnWidth::Lg)->sortable()->currency('EUR'),
            NumberColumn::make('prices_count')->label(__('workbench.tables.columns.prices-count'))->width(ColumnWidth::Lg)->sortable()->toggleable(),
            BooleanColumn::make('featured')->label(__('workbench.tables.columns.featured'))->width(ColumnWidth::Lg)->sortable()->toggleable(),
            TextColumn::make('tags')->label(__('workbench.tables.columns.tags'))->width(ColumnWidth::Xl)->multiple('name')->badge('color')->toggleable(),
            TextColumn::make('created_at')->label(__('workbench.tables.columns.created-at'))->width(ColumnWidth::Xl)->sortable()->dateTime()->toggleable(),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->width(ColumnWidth::Xl)->sortable()->dateTime()->toggleable(true),
            StatusBadgeColumn::make('status')->label(__('workbench.tables.columns.status'))->pinned(Side::End)->colorMap(['draft' => 'gray', 'active' => 'green', 'archived' => 'red']),
        ];
    }

    #[\Override]
    public function pinnableColumns(): bool
    {
        return true;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Component>
     */
    #[\Override]
    public function actions(array $row): array
    {
        return [
            Link::make(__('workbench.tables.products.edit'), 'product-edit')
                ->href('/products/'.$row['id'].'/edit'),
        ];
    }

    #[\Override]
    public function rowUrl(array $row): ?string
    {
        return '/products/'.$row['id'].'/edit';
    }

    /**
     * @return Builder<Product>
     */
    protected function query(): Builder
    {
        return Product::query()
            ->select(['id', 'name', 'sku', 'status', 'featured', 'created_at', 'updated_at'])
            ->selectSub(
                SalesPrice::query()
                    ->select('amount')
                    ->whereColumn('product_id', 'products.id')
                    ->whereNull('group_id')
                    ->limit(1),
                'default_price',
            )
            ->withCount('salesPrices as prices_count');
    }
}
