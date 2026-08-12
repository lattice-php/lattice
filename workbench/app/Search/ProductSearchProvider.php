<?php
declare(strict_types=1);

namespace Workbench\App\Search;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Lattice\Search\AsSearchProvider;
use Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Search\SearchCategory;
use Lattice\Search\SearchQuery;
use Lattice\Search\SearchResult;
use Lattice\Search\SearchResultItem;
use Lattice\Search\SearchResults;
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
        return new SearchCategory('products', __('workbench.navigation.products'), 'package');
    }

    public function count(SearchQuery $query): int
    {
        return $this->query($query->query)->count();
    }

    public function search(SearchQuery $query): SearchResults
    {
        $builder = $this->query($query->query);
        $total = $builder->count();
        $rows = array_values($builder
            ->forPage($query->page, $query->perPage)
            ->get()
            ->map(fn (Product $product): SearchResult => $this->result($product))
            ->all());

        return new SearchResults($rows, $total);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        $product = Product::query()->find($id);

        return $product instanceof Product ? $this->result($product) : null;
    }

    /** @return Builder<Product> */
    private function query(string $term): Builder
    {
        return Product::query()
            ->when($term !== '', function (Builder $builder) use ($term): void {
                $builder->where(function (Builder $query) use ($term): void {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('sku', 'like', "%{$term}%");
                });
            })
            ->orderBy('name');
    }

    private function result(Product $product): SearchResult
    {
        return SearchResult::make('products', new SearchResultItem(
            id: (string) $product->getKey(),
            title: $product->name,
            link: route('products.index', ['q' => $product->name], absolute: false),
            subtitle: $product->sku,
            badge: $product->status === 'active' ? null : $product->status,
        ));
    }
}
