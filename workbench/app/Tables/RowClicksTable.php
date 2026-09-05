<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\MoneyColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Components\RowClick;
use Lattice\Ui\Components\DescriptionList;
use Lattice\Ui\Components\Entries\TextEntry;
use Lattice\Ui\Components\Modal;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;
use Workbench\App\Tables\Columns\StatusBadgeColumn;

#[AsTable('workbench.demo.row-clicks')]
class RowClicksTable extends BaseProductsDemoTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable(),
            TextColumn::make('sku')->label(__('workbench.tables.columns.sku'))->sortable(),
            MoneyColumn::make('default_price')->label(__('workbench.tables.columns.default-price'))->currency('EUR'),
            StatusBadgeColumn::make('status')->label(__('workbench.tables.columns.status'))
                ->colorMap(['draft' => 'gray', 'active' => 'green', 'archived' => 'red']),
        ];
    }

    /**
     * @param  array<string, mixed>  $row
     */
    #[\Override]
    public function rowClick(array $row): ?RowClick
    {
        return RowClick::make()->modal(fn (): Modal => Modal::make('row-click-details')
            ->title(is_string($row['name']) ? $row['name'] : '')
            ->schema([
                DescriptionList::make('row-click-facts')->schema([
                    TextEntry::make('sku', __('workbench.tables.columns.sku'))->value($row['sku']),
                    TextEntry::make('status', __('workbench.tables.columns.status'))->value($row['status']),
                ]),
            ]));
    }

    /**
     * @return Builder<Product>
     */
    protected function query(): Builder
    {
        return Product::query()
            ->select(['id', 'name', 'sku', 'status'])
            ->selectSub(
                SalesPrice::query()
                    ->select('amount')
                    ->whereColumn('product_id', 'products.id')
                    ->whereNull('group_id')
                    ->limit(1),
                'default_price',
            );
    }
}
