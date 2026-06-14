<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Filters\BaseFilter;
use Lattice\Lattice\Tables\Filters\DateRangeFilter;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Tables\Filters\SelectFilter;
use Lattice\Lattice\Tables\Filters\TernaryFilter;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Actions\EditProductAction;
use Workbench\App\Actions\RejectProductAction;
use Workbench\App\Actions\RejectSelectedProductsAction;
use Workbench\App\Models\Product;
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
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable()->filterable(),
            TextColumn::make('sku')->label(__('workbench.tables.columns.sku'))->sortable()->filterable(),
            TextColumn::make('price')->label(__('workbench.tables.columns.price'))->sortable()->numeric()->filterable(),
            StatusBadgeColumn::make('status')->label(__('workbench.tables.columns.status'))->filterable(Op::Equals)->colorMap(['draft' => 'gray', 'active' => 'green', 'archived' => 'red']),
            TextColumn::make('featured')->label(__('workbench.tables.columns.featured'))->sortable()->boolean()->filterable(),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->sortable()->date('Y-m-d H:i:s')->filterable(),
        ];
    }

    /**
     * @return array<int, BaseFilter>
     */
    public function filters(): array
    {
        return [
            SelectFilter::make('status')
                ->label(__('workbench.tables.columns.status'))
                ->options([
                    SelectFilter::option('Draft', 'draft'),
                    SelectFilter::option('Active', 'active'),
                    SelectFilter::option('Archived', 'archived'),
                ])
                ->multiple(),
            TernaryFilter::make('featured')
                ->label(__('workbench.tables.columns.featured')),
            DateRangeFilter::make('updated_at')
                ->label(__('workbench.tables.columns.updated-at')),
            Filter::make('high_value')
                ->label('High value')
                ->query(fn (Builder $query): Builder => $query->where('price', '>', 1000)),
        ];
    }

    public function striped(): bool
    {
        return true;
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Product::query()->select(['id', 'name', 'sku', 'price', 'status', 'featured', 'updated_at']);

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
            Link::make(__('workbench.tables.products.edit'), 'product-edit')
                ->href('/products/'.$row['id'].'/edit'),
            Action::use(EditProductAction::class)
                ->context(['product_id' => $row['id']]),
            Action::use(ArchiveProductAction::class)
                ->context(['product_id' => $row['id']]),
            Action::use(RejectProductAction::class)
                ->context(['product_id' => $row['id']]),
        ];
    }

    /**
     * @return array<int, Action>
     */
    public function bulkActions(): array
    {
        return [
            BulkAction::use(ArchiveSelectedProductsAction::class),
            BulkAction::use(RejectSelectedProductsAction::class),
        ];
    }
}
