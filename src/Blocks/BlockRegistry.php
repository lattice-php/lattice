<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks;

use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Attributes\DefinitionAttribute;
use Lattice\Lattice\Core\DefinitionRegistry;

/**
 * @extends DefinitionRegistry<BlockDefinition>
 */
final class BlockRegistry extends DefinitionRegistry
{
    /**
     * @return class-string<BlockDefinition>
     */
    protected function definitionClass(): string
    {
        return BlockDefinition::class;
    }

    /**
     * @return class-string<DefinitionAttribute>
     */
    public function attributeClass(): string
    {
        return AsBlock::class;
    }

    protected function name(): string
    {
        return 'block';
    }

    public function group(): string
    {
        return 'blocks';
    }
}
