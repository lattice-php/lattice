<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Contracts;

use Lattice\Lattice\Ui\Values\TreeNode;

/**
 * Where a tree's nodes come from. Lattice ships a callback and an Eloquent
 * source; implement this for any other backing store. Keeps the Tree component
 * free of persistence concerns, mirroring TableSource.
 */
interface TreeSource
{
    /** @return iterable<int, TreeNode> */
    public function roots(): iterable;

    /** @return iterable<int, TreeNode> */
    public function children(string $parentId): iterable;
}
