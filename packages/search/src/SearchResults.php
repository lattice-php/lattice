<?php
declare(strict_types=1);

namespace Lattice\Search;

final readonly class SearchResults
{
    /** @param list<SearchResult> $rows */
    public function __construct(
        public array $rows,
        public int $total,
    ) {}
}
