<?php

declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Actions\Components\BulkAction;
use Lattice\Lattice\Attributes\Table;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Components\Link;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\EloquentTableDefinition;
use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Actions\ArchiveProductAction;
use Workbench\App\Actions\ArchiveSelectedProductsAction;
use Workbench\App\Models\Product;

/**
 * @extends EloquentTableDefinition<Product>
 */
#[Table('workbench.products')]
class ProductsTable extends EloquentTableDefinition
{
    /**
     * @return array<int, TextColumn>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label('Name')->sortable()->filterable(),
            TextColumn::make('sku')->label('SKU')->sortable()->filterable(),
            TextColumn::make('price')->label('Price')->sortable()->numeric()->filterable(),
            TextColumn::make('status')->label('Status')->sortable()->filterable(FilterOperator::Equals),
            TextColumn::make('featured')->label('Featured')->sortable()->boolean()->filterable(),
            TextColumn::make('updated_at')->label('Updated at')->sortable()->date('Y-m-d H:i:s')->filterable(),
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

        if ($query->sorts() === []) {
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
            Link::make('Edit')
                ->href('/products/'.$row['id'].'/edit'),
            Action::use(ArchiveProductAction::class)
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
        ];
    }
}
