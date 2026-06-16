<?php
declare(strict_types=1);

namespace Lattice\Lattice\GlobalSearch;

final readonly class SearchQuery
{
    public function __construct(
        public string $query,
        public ?string $category,
        public int $page,
        public int $perPage,
        public ?string $locale = null,
    ) {}
}
