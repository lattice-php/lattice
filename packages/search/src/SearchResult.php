<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class SearchResult
{
    public function __construct(
        public SearchResultCategory $category,
        public SearchResultItem $item,
    ) {}

    public static function make(string $category, SearchResultItem $item): self
    {
        return new self(new SearchResultCategory($category), $item);
    }
}
