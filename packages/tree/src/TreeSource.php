<?php
declare(strict_types=1);

namespace Lattice\Tree;

/**
 * Where a tree's nodes come from. The package ships a callback and an Eloquent
 * source; implement this for any other backing store. Keeps the Tree component
 * free of persistence concerns.
 */
interface TreeSource
{
    /** @return iterable<int, TreeNode> */
    public function roots(): iterable;

    /** @return iterable<int, TreeNode> */
    public function children(string $parentId): iterable;
}
