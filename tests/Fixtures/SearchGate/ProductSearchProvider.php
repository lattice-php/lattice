<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\SearchGate;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Lattice\Search\AsSearchProvider;
use Lattice\Search\EloquentSearchProvider;
use Lattice\Search\SearchCategory;
use Lattice\Search\SearchResult;
use Lattice\Search\SearchResultItem;
use Workbench\App\Models\Product;

/**
 * @extends EloquentSearchProvider<Product>
 */
#[AsSearchProvider('workbench-products')]
final class ProductSearchProvider extends EloquentSearchProvider
{
    public function category(): SearchCategory
    {
        return new SearchCategory('workbench-products', 'Products', 'package');
    }

    /** @return Builder<Product> */
    protected function query(): Builder
    {
        return Product::query()->orderBy('name');
    }

    protected function searchColumns(): array
    {
        return ['name'];
    }

    /** @param Product $model */
    protected function result(Model $model): SearchResult
    {
        return SearchResult::make(
            'workbench-products',
            new SearchResultItem((string) $model->getKey(), $model->name, '/products/'.$model->getKey()),
        );
    }
}
