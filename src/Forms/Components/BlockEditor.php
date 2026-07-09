<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Components;

use InvalidArgumentException;
use Lattice\Lattice\Attributes\AsBlock;
use Lattice\Lattice\Blocks\BlockDefinition;
use Lattice\Lattice\Forms\Attributes\AsField;
use Lattice\Lattice\Forms\Enums\FieldType;
use Spatie\Attributes\Attributes;

#[AsField(FieldType::BlockEditor)]
class BlockEditor extends Builder
{
    /**
     * @param  array<int, class-string<BlockDefinition>>  $blocks
     */
    #[\Override]
    public function blocks(array $blocks): static
    {
        $this->blocks = array_map(
            fn (string $class): Block => Block::make($this->keyFor($class))->schema(app($class)->attributes()),
            $blocks,
        );

        return $this;
    }

    /**
     * @param  class-string<BlockDefinition>  $class
     */
    private function keyFor(string $class): string
    {
        $attribute = Attributes::get($class, AsBlock::class);

        if (! $attribute instanceof AsBlock) {
            throw new InvalidArgumentException("Block [{$class}] is missing the [AsBlock] attribute.");
        }

        return $attribute->key;
    }
}
