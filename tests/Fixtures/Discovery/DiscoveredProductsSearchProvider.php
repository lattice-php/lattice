<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Discovery;

use Illuminate\Http\Request;
use Lattice\Lattice\Attributes\AsSearchProvider;
use Lattice\Lattice\GlobalSearch\Contracts\SearchResultProvider;
use Lattice\Lattice\GlobalSearch\SearchCategory;
use Lattice\Lattice\GlobalSearch\SearchQuery;
use Lattice\Lattice\GlobalSearch\SearchResult;
use Lattice\Lattice\GlobalSearch\SearchResultItem;
use Lattice\Lattice\GlobalSearch\SearchResults;

#[AsSearchProvider('products')]
final class DiscoveredProductsSearchProvider implements SearchResultProvider
{
    /** @var array<int, array{id:string,title:string}> */
    public static array $rows = [];

    public static bool $authorized = true;

    public function authorize(Request $request): bool
    {
        return self::$authorized;
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
        $offset = ($query->page - 1) * $query->perPage;
        $slice = array_slice($matching, $offset, $query->perPage);

        $rows = array_map(
            fn (array $row): SearchResult => new SearchResult('products', new SearchResultItem(
                id: $row['id'], title: $row['title'], link: '/products/'.$row['id'],
            )),
            $slice,
        );

        return new SearchResults($rows, count($matching));
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        foreach (self::$rows as $row) {
            if ($row['id'] === $id) {
                return new SearchResult('products', new SearchResultItem(
                    id: $row['id'], title: $row['title'], link: '/products/'.$row['id'],
                ));
            }
        }

        return null;
    }

    /** @return array<int, array{id:string,title:string}> */
    private function matching(string $query): array
    {
        if ($query === '') {
            return self::$rows;
        }

        return array_values(array_filter(
            self::$rows,
            fn (array $row): bool => str_contains(strtolower($row['title']), strtolower($query)),
        ));
    }
}
