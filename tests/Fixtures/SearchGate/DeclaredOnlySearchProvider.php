<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\SearchGate;

use Illuminate\Http\Request;
use Lattice\Core\Concerns\AuthorizesByDeclaration;
use Lattice\Search\AsSearchProvider;
use Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Search\SearchCategory;
use Lattice\Search\SearchQuery;
use Lattice\Search\SearchResult;
use Lattice\Search\SearchResultItem;
use Lattice\Search\SearchResults;

#[AsSearchProvider('memos', can: 'memos.view')]
final class DeclaredOnlySearchProvider implements SearchResultProvider
{
    use AuthorizesByDeclaration;

    public function category(): SearchCategory
    {
        return new SearchCategory('memos', 'Memos', 'file');
    }

    public function count(SearchQuery $query): int
    {
        return 1;
    }

    public function search(SearchQuery $query): SearchResults
    {
        return new SearchResults([$this->memo()], 1);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        return $id === '1' ? $this->memo() : null;
    }

    private function memo(): SearchResult
    {
        return SearchResult::make('memos', new SearchResultItem('1', 'Board memo', '/memos/1'));
    }
}
