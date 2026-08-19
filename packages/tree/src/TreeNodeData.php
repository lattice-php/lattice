<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;

#[TypeScript]
final readonly class TreeNodeData
{
    /**
     * @param  list<Component>  $schema
     * @param  list<TreeNodeData>  $children
     */
    public function __construct(
        public string $id,
        public string $label,
        public array $schema,
        public ?string $href,
        public ?string $class,
        public bool $disabled,
        public bool $hasChildren,
        public array $children,
    ) {}
}
