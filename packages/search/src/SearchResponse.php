<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class SearchResponse
{
    /**
     * @param  list<SearchResult>  $data
     * @param  list<SearchCategory>  $categories
     */
    public function __construct(
        public array $data,
        public array $categories,
        public SearchPagination $pagination,
        public SearchState $state,
    ) {}
}
