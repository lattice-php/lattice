<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Lattice\Lattice\Attributes\AsTable;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\TextColumn;
use Lattice\Lattice\Tables\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Lattice\Tables\TableQuery;
use Workbench\App\Models\Product;

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.demo.text-columns')]
class TextColumnsTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            TextColumn::make('name')->label(__('workbench.tables.columns.name'))->sortable()->filterable(),
            TextColumn::make('sku')->label(__('workbench.tables.columns.sku'))->sortable()->copyable(),
            TextColumn::make('tags')->label(__('workbench.tables.columns.tags'))->multiple('name')->badge('color')->filterable(),
            TextColumn::make('updated_at')->label(__('workbench.tables.columns.updated-at'))->sortable()->dateTime(),
        ];
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Product::query()->select(['id', 'name', 'sku', 'updated_at']);

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }
}
