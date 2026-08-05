<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Tables\Enums\PaginationType;

/**
 * The table's pagination metadata as a single, closed wire shape: every producer
 * fills the same keys, leaving the ones that do not apply to its mode as null.
 * The `mode` discriminant lets the client decide which keys are meaningful.
 */
#[TypeScript]
final readonly class TablePagination
{
    public function __construct(
        public PaginationType $mode,
        public ?int $currentPage = null,
        public ?int $lastPage = null,
        public ?int $perPage = null,
        public ?int $total = null,
        public ?int $from = null,
        public ?int $to = null,
        public bool $hasMore = false,
        public ?int $nextPage = null,
    ) {}

    /**
     * The pre-load placeholder a lazy table renders before its first fetch:
     * only the mode is known, every count is still null.
     */
    public static function pending(PaginationType $mode): self
    {
        return new self($mode);
    }
}
