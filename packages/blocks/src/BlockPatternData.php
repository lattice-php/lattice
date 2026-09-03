<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class BlockPatternData
{
    /**
     * @param  list<BlockNode>  $blocks
     */
    public function __construct(
        public string $key,
        public string $label,
        public ?string $description,
        public ?string $icon,
        public array $blocks,
    ) {}
}
