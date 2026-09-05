<?php
declare(strict_types=1);

namespace Lattice\Tests\Fixtures\SearchGate;

use Illuminate\Http\Request;
use Lattice\Search\AsSearchProvider;
use Lattice\Search\Contracts\SearchResultProvider;
use Lattice\Search\SearchCategory;
use Lattice\Search\SearchQuery;
use Lattice\Search\SearchResult;
use Lattice\Search\SearchResultItem;
use Lattice\Search\SearchResults;
use stdClass;

#[AsSearchProvider('quotes', can: 'quotes.view', on: 'workspace')]
final class UnresolvableSubjectSearchProvider implements SearchResultProvider
{
    public ?object $workspace = null;

    public function authorize(Request $request): bool
    {
        return true;
    }

    public function category(): SearchCategory
    {
        return new SearchCategory('quotes', 'Quotes', 'file');
    }

    public function count(SearchQuery $query): int
    {
        return 1;
    }

    public function search(SearchQuery $query): SearchResults
    {
        return new SearchResults([$this->invoice()], 1);
    }

    public function resolve(string $id, Request $request): ?SearchResult
    {
        return $id === '1' ? $this->invoice() : null;
    }

    public function withWorkspace(): self
    {
        $this->workspace = new stdClass;

        return $this;
    }

    private function invoice(): SearchResult
    {
        return SearchResult::make('quotes', new SearchResultItem('1', 'Invoice 2026-001', '/quotes/1'));
    }
}
