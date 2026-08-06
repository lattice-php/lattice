<?php
declare(strict_types=1);

namespace Workbench\App\Tables;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Lattice\Table\Attributes\AsTable;
use Lattice\Table\Columns\Column;
use Lattice\Table\Columns\ImageColumn;
use Lattice\Table\Columns\TextColumn;
use Lattice\Table\Sources\Eloquent\EloquentTableDefinition;
use Lattice\Table\TableQuery;
use Workbench\App\Models\Product;

/**
 * @extends EloquentTableDefinition<Product>
 */
#[AsTable('workbench.products.media')]
class ProductMediaTable extends EloquentTableDefinition
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array
    {
        return [
            ImageColumn::make('gallery_cover_url')->label(__('workbench.tables.columns.image'))->size(44),
            TextColumn::make('name')->label(__('workbench.tables.columns.name')),
        ];
    }

    /**
     * @return Builder<Product>
     */
    public function builder(TableQuery $query): Builder
    {
        $builder = Product::query()
            ->select(['id', 'name'])
            ->with('galleryMedia')
            ->afterQuery(function (Collection $products): Collection {
                $products->each->append('gallery_cover_url');

                return $products;
            });

        if ($query->sorts === []) {
            $builder->latest('id');
        }

        return $builder;
    }
}
