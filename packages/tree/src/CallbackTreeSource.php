<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Closure;

final readonly class CallbackTreeSource implements TreeSource
{
    /**
     * @param  Closure(): list<TreeNode>  $roots
     * @param  (Closure(string): list<TreeNode>)|null  $children
     * @param  (Closure(string): (list<string>|null))|null  $path
     */
    public function __construct(
        private Closure $roots,
        private ?Closure $children = null,
        private ?Closure $path = null,
    ) {}

    public function roots(): array
    {
        return ($this->roots)();
    }

    public function children(string $parentId): array
    {
        return $this->children instanceof Closure ? ($this->children)($parentId) : [];
    }

    public function path(string $nodeId): ?array
    {
        return $this->path instanceof Closure ? ($this->path)($nodeId) : null;
    }
}
