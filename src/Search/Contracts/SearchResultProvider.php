<?php
declare(strict_types=1);

namespace Lattice\Lattice\Search\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\Search\SearchCategory;
use Lattice\Lattice\Search\SearchQuery;
use Lattice\Lattice\Search\SearchResult;
use Lattice\Lattice\Search\SearchResults;

interface SearchResultProvider
{
    public function authorize(Request $request): bool;

    public function category(): SearchCategory;

    public function count(SearchQuery $query): int;

    public function search(SearchQuery $query): SearchResults;

    public function resolve(string $id, Request $request): ?SearchResult;
}
