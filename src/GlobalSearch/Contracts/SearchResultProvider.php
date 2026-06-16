<?php
declare(strict_types=1);

namespace Lattice\Lattice\GlobalSearch\Contracts;

use Illuminate\Http\Request;
use Lattice\Lattice\GlobalSearch\SearchCategory;
use Lattice\Lattice\GlobalSearch\SearchQuery;
use Lattice\Lattice\GlobalSearch\SearchResult;
use Lattice\Lattice\GlobalSearch\SearchResults;

interface SearchResultProvider
{
    public function authorize(Request $request): bool;

    public function category(): SearchCategory;

    public function count(SearchQuery $query): int;

    public function search(SearchQuery $query): SearchResults;

    public function resolve(string $id, Request $request): ?SearchResult;
}
