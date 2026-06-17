<?php
declare(strict_types=1);

namespace Lattice\Lattice\Search;

use JsonSerializable;

final readonly class SearchResult implements JsonSerializable
{
    public function __construct(
        public string $category,
        public SearchResultItem $item,
    ) {}

    /** @return array{category:array{name:string},item:array<string,mixed>} */
    public function jsonSerialize(): array
    {
        return [
            'category' => ['name' => $this->category],
            'item' => $this->item->jsonSerialize(),
        ];
    }
}
