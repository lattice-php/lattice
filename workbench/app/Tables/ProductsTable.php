<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\ActionGroup;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Tables\Columns\BooleanColumn;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ImageColumn;
use Lattice\Lattice\Tables\Columns\MoneyColumn;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Filters\BaseFilter;
use Lattice\Lattice\Tables\Filters\DateRangeFilter;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Filters\TernaryFilter;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Actions\EditProductAction;
use Workbench\App\Actions\RejectProductAction;
use Workbench\App\Actions\RejectSelectedProductsAction;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;
use Workbench\App\Tables\Columns\StatusBadgeColumn;

/**
 * @extends EloquentTableDefinition<Product>
 */
#[Table('workbench.products')]
class ProductsTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            ImageColumn::make('image')->label(__('workbench.tables.columns.image'))->size(44),
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable()->filterable(),
            TextColumn::make('sku')->label(__('workbench.tables.columns.sku'))->sortable()->filterable(),
            MoneyColumn::make('default_price')->label(__('workbench.tables.columns.default-price'))->sortable()->currency('EUR'),
            StatusBadgeColumn::make('status')->label(__('workbench.tables.columns.status'))->filterOptions([
                'draft' => 'Draft',
                'active' => 'Active',
                'archived' => 'Archived',
            ])->colorMap(['draft' => 'gray', 'active' => 'green', 'archived' => 'red']),
            BooleanColumn::make('featured')->label(__('workbench.tables.columns.featured'))->sortable()->filterable(),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->sortable()->date('Y-m-d H:i:s')->filterable(),
        ];
    }

    /**
     * @return array<int, BaseFilter>
     */
    #[\Override]
    public function filters(): array
    {
        return [
            TernaryFilter::make('featured')
                ->label(__('workbench.tables.columns.featured')),
            DateRangeFilter::make('updated_at')
                ->label(__('workbench.tables.columns.updated-at')),
            Filter::make('high_value')
                ->label('High value')
                ->query(fn (Builder $query): Builder => $query->whereHas(
                    'salesPrices',
                    fn (Builder $salesPrices): Builder => $salesPrices
                        ->whereNull('group_id')
                        ->where('amount', '>', 1000),
                )),
        ];
    }

    #[\Override]
    public function striped(): bool
    {
        return true;
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Product::query()
            ->with('images')
            ->select(['id', 'name', 'sku', 'status', 'featured', 'updated_at'])
            ->selectSub(
                SalesPrice::query()
                    ->select('amount')
                    ->whereColumn('product_id', 'products.id')
                    ->whereNull('group_id')
                    ->limit(1),
                'default_price',
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
            ActionGroup::make('product-actions-'.$row['id'])
                ->key('product-actions')
                ->label(__('workbench.tables.products.actions'))
                ->actions([
                    Link::make(__('workbench.tables.products.edit'), 'product-edit')
                        ->href('/products/'.$row['id'].'/edit'),
                    Action::use(EditProductAction::class)
                        ->context(['product_id' => $row['id']]),
                    Action::use(ArchiveProductAction::class)
                        ->context(['product_id' => $row['id']]),
                    Action::use(RejectProductAction::class)
                        ->context(['product_id' => $row['id']]),
                ]),
        ];
    }

    /**
     * @return array<int, Action>
     */
    #[\Override]
    public function bulkActions(): array
    {
        return [
            BulkAction::use(ArchiveSelectedProductsAction::class),
            BulkAction::use(RejectSelectedProductsAction::class),
        ];
    }
}
