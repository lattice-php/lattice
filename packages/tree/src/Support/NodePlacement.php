<?php
declare(strict_types=1);

namespace Lattice\Tree\Support;

/**
 * A node's place in an adjacency list: its id, its parent's id (null for a
 * root), and its zero-based position among that parent's children. Used both
 * as the current-state input to {@see AdjacencyListMovePlanner} and as the
 * changed assignments it returns.
 */
final readonly class NodePlacement
{
    public function __construct(
        public int|string $id,
        public int|string|null $parentId,
        public int $position,
    ) {}
}
