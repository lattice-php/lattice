<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks;

use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FormData;

abstract class BlockDefinition extends Definition
{
    /**
     * @return array<int, Field>
     */
    abstract public function attributes(): array;

    abstract public function render(FormData $data, BlockSlots $slots): PageSchema;

    /**
     * @return array<int, string>
     */
    public function inlineText(): array
    {
        return [];
    }

    /**
     * @return array<int, string>
     */
    public function slots(): array
    {
        return [];
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public function migrate(array $attributes, int $from): array
    {
        return $attributes;
    }
}
