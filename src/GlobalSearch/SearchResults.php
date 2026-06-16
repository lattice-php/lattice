<?php
declare(strict_types=1);

namespace Lattice\Lattice\GlobalSearch;

final readonly class SearchResults
{
    /** @param array<int, SearchResult> $rows */
    public function __construct(
        public array $rows,
        public int $total,
    ) {}
}
