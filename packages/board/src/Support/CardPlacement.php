<?php
declare(strict_types=1);

namespace Lattice\Board\Support;

/**
 * A card's place on a board: its id, the key of the column it sits in, and
 * its zero-based position among that column's cards. Used both as the
 * current-state input to {@see BoardMovePlanner} and as the changed
 * assignments it returns.
 */
final readonly class CardPlacement
{
    public function __construct(
        public int|string $id,
        public string $columnKey,
        public int $position,
    ) {}
}
