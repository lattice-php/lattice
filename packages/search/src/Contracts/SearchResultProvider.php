<?php
declare(strict_types=1);

namespace Lattice\Search\Contracts;

use Illuminate\Http\Request;
use Lattice\Core\Contracts\Authorizable;
use Lattice\Search\AsSearchProvider;
use Lattice\Search\SearchCategory;
use Lattice\Search\SearchQuery;
use Lattice\Search\SearchResult;
use Lattice\Search\SearchResults;

/**
 * Gated like any other Lattice definition: the abilities declared on
 * {@see AsSearchProvider} are checked before
 * {@see Authorizable::authorize()}, which can only narrow them further.
 */
interface SearchResultProvider extends Authorizable
{
    public function category(): SearchCategory;

    public function count(SearchQuery $query): int;

    public function search(SearchQuery $query): SearchResults;

    public function resolve(string $id, Request $request): ?SearchResult;
}
