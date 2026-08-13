<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Search\Enums\SearchMode;

#[TypeScript]
final readonly class SearchState
{
    public function __construct(
        public string $query,
        public ?string $category,
        public int $perPage,
        public bool $countsIncluded,
        public SearchMode $mode,
    ) {}
}
