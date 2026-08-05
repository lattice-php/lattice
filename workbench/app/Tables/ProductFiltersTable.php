<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Core\Attributes\AsTable;
use Lattice\Table\Columns\BooleanColumn;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Filters\DateRangeFilter;
use Lattice\Table\Filters\Filter;
use Lattice\Table\Filters\SelectFilter;
use Lattice\Table\Filters\TernaryFilter;
use Lattice\Table\Filters\ToggleFilter;
use Workbench\App\Models\Product;

#[AsTable('workbench.demo.filters')]
class ProductFiltersTable extends BaseProductsDemoTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable()->filterable(),
            TextColumn::make('status')->label(__('workbench.tables.columns.status')),
            BooleanColumn::make('featured')->label(__('workbench.tables.columns.featured'))->sortable()->filterable(),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->sortable()->dateTime()->filterable(),
        ];
    }

    /**
     * @return array<int, Filter>
     */
    #[\Override]
    public function filters(): array
    {
        return [
            SelectFilter::make('status')
                ->label(__('workbench.tables.columns.status'))
                ->options([
                    'draft' => 'Draft',
                    'active' => 'Active',
                    'archived' => 'Archived',
                ]),
            TernaryFilter::make('featured')
                ->label(__('workbench.tables.columns.featured')),
            DateRangeFilter::make('updated_at')
                ->label(__('workbench.tables.columns.updated-at')),
            ToggleFilter::make('high_value')
                ->label('High value')
                ->query(fn (Builder $query): Builder => $query->whereHas(
                    'salesPrices',
                    fn (Builder $salesPrices): Builder => $salesPrices
                        ->whereNull('group_id')
                        ->where('amount', '>', 1000),
                )),
        ];
    }

    /**
     * @return Builder<Product>
     */
    protected function query(): Builder
    {
        return Product::query()->select(['id', 'name', 'status', 'featured', 'updated_at']);
    }
}
