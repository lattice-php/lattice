<?php
declare(strict_types=1);

namespace Lattice\Lattice\Search;

use JsonSerializable;

final readonly class SearchPagination implements JsonSerializable
{
    public function __construct(
        public int $page,
        public int $perPage,
        public int $total,
        public bool $hasMore,
        public ?int $nextPage,
    ) {}

    public static function forPage(int $page, int $perPage, int $total): self
    {
        $hasMore = $page * $perPage < $total;

        return new self($page, $perPage, $total, $hasMore, $hasMore ? $page + 1 : null);
    }

    /** @return array{page:int,perPage:int,total:int,hasMore:bool,nextPage:?int} */
    public function jsonSerialize(): array
    {
        return [
            'page' => $this->page,
            'perPage' => $this->perPage,
            'total' => $this->total,
            'hasMore' => $this->hasMore,
            'nextPage' => $this->nextPage,
        ];
    }
}
