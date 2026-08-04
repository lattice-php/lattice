<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Closure;

final readonly class CallbackTreeSource implements TreeSource
{
    /**
     * @param  Closure(): iterable<int, TreeNode>  $roots
     * @param  (Closure(string): iterable<int, TreeNode>)|null  $children
     */
    public function __construct(
        private Closure $roots,
        private ?Closure $children = null,
    ) {}

    public function roots(): iterable
    {
        return ($this->roots)();
    }

    public function children(string $parentId): iterable
    {
        return $this->children instanceof Closure ? ($this->children)($parentId) : [];
    }
}
