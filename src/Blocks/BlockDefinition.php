<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks;

use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Core\PageSchema;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Forms\FormData;
use Lattice\Lattice\Ui\Enums\Icon;

abstract class BlockDefinition extends Definition
{
    /**
     * @return array<int, Field>
     */
    abstract public function attributes(): array;

    abstract public function render(FormData $data, BlockSlots $slots): PageSchema;

    /**
     * The human-readable name shown in the editor; defaults to a headline of
     * the registry key.
     */
    public function label(): ?string
    {
        return null;
    }

    /**
     * The icon shown next to the block in the editor.
     */
    public function icon(): Icon|string|null
    {
        return null;
    }

    /**
     * A short explanation shown in the editor's add menu.
     */
    public function description(): ?string
    {
        return null;
    }

    /**
     * @return array<int, string>
     */
    public function inlineText(): array
    {
        return [];
    }

    /**
     * The named child-row lists of this block: plain names for unrestricted
     * slots, or {@see Slot} instances to restrict a slot to certain blocks.
     *
     * @return array<int, Slot|string>
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
