<?php
declare(strict_types=1);

namespace Workbench\App\Search;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsSearchProvider;
use Lattice\Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Lattice\Search\SearchCategory;
use Lattice\Lattice\Search\SearchQuery;
use Lattice\Lattice\Search\SearchResult;
use Lattice\Lattice\Search\SearchResultItem;
use Lattice\Lattice\Search\SearchResults;
use Workbench\App\Models\Product;

#[AsSearchProvider('products')]
final class ProductSearchProvider implements SearchResultProvider
{
    public function authorize(Request $request): bool
    {
        return true;
    }

    public function category(): SearchCategory
    {
        return new SearchCategory('products', __('workbench.global-search.products'), 'package');
    }

    public function count(SearchQuery $query): int
    {
        return $this->query($query->query)->count();
    }

    public function search(SearchQuery $query): SearchResults
    {
        $builder = $this->query($query->query);
        $total = $builder->count();

        $products = $builder
            ->forPage($query->page, $query->perPage)
            ->get();

        $rows = $products->map(fn (Product $product): SearchResult => $this->toResult($product))->all();

        return new SearchResults($rows, $total);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        $product = Product::query()->find($id);

        return $product === null ? null : $this->toResult($product);
    }

    /** @return Builder<Product> */
    private function query(string $term): Builder
    {
        return Product::query()
            ->when($term !== '', function ($builder) use ($term): void {
                $builder->where('name', 'like', "%{$term}%")->orWhere('sku', 'like', "%{$term}%");
            })
            ->orderBy('name');
    }

    private function toResult(Product $product): SearchResult
    {
        return new SearchResult('products', new SearchResultItem(
            id: (string) $product->getKey(),
            title: $product->name,
            link: '/products/'.$product->getKey(),
            subtitle: $product->sku,
            additionalInfo: null,
            badge: $product->status === 'active' ? null : $product->status,
        ));
    }
}
