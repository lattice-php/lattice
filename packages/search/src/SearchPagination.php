<?php
declare(strict_types=1);

namespace Lattice\Search;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class SearchPagination
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
}
