<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\Search;

use Illuminate\Http\Request;
use Lattice\Search\AsSearchProvider;
use Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Search\SearchCategory;
use Lattice\Search\SearchQuery;
use Lattice\Search\SearchResult;
use Lattice\Search\SearchResultItem;
use Lattice\Search\SearchResults;

#[AsSearchProvider('products')]
final class FakeSearchProvider implements SearchResultProvider
{
    public bool $authorized = true;

    public function authorize(Request $request): bool
    {
        return $this->authorized;
    }

    public function category(): SearchCategory
    {
        return new SearchCategory('products', 'Products', 'package');
    }

    public function count(SearchQuery $query): int
    {
        return count($this->matching($query->query));
    }

    public function search(SearchQuery $query): SearchResults
    {
        $matching = $this->matching($query->query);

        return new SearchResults(
            rows: array_slice($matching, ($query->page - 1) * $query->perPage, $query->perPage),
            total: count($matching),
        );
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        return collect($this->matching(''))->first(
            fn (SearchResult $result): bool => $result->item->id === $id,
        );
    }

    /** @return list<SearchResult> */
    private function matching(string $query): array
    {
        return array_values(collect([
            SearchResult::make('products', new SearchResultItem('1', 'Desk Lamp', '/products?search=Desk+Lamp', 'LAMP-1')),
            SearchResult::make('products', new SearchResultItem('2', 'Office Chair', '/products?search=Office+Chair', 'CHAIR-2')),
        ])->filter(
            fn (SearchResult $result): bool => $query === '' || str_contains(strtolower($result->item->title), strtolower($query)),
        )->all());
    }
}
