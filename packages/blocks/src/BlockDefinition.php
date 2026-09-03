<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Contracts\View\View;
use Lattice\Blocks\Attributes\AsBlock;
use Lattice\Blocks\Enums\BlockCategory;
use Lattice\Core\Definition;
use Lattice\Core\Support\Wire;
use Lattice\Form\Components\Field;
use Lattice\Ui\Components\Component;
use Spatie\Attributes\Attributes;

/**
 * A block type: the fields its data validates against, the slots that hold
 * child blocks, and a render built from Lattice components. Discovered through
 * {@see AsBlock}; the attribute carries the editor metadata.
 */
abstract class BlockDefinition extends Definition
{
    /**
     * @return array<int, Field>
     */
    abstract public function fields(): array;

    abstract public function render(BlockData $data, BlockSlots $slots): Component;

    /**
     * The block's markup for a plain HTML output such as a public page. Null
     * means the block has no HTML form; {@see BlockHtmlRenderer} then falls
     * back to the configured handler or throws. An empty string renders
     * nothing for this block.
     */
    public function html(BlockData $data, BlockSlots $slots): View|Htmlable|string|null
    {
        return null;
    }

    /**
     * The slots this block offers for the given data; null asks for every
     * slot the block can ever have, which the editor uses for its rules.
     *
     * @param  array<string, mixed>|null  $data
     * @return array<int, Slot>
     */
    public function slots(?array $data = null): array
    {
        return [];
    }

    public function supports(): BlockSupports
    {
        return BlockSupports::all();
    }

    /**
     * Upgrade stored data written by an older version of this block.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function migrate(array $data, int $from): array
    {
        return $data;
    }

    public function label(): string
    {
        $label = $this->attribute()->label;

        return $label ?? str(class_basename(static::class))->beforeLast('Block')->headline()->toString();
    }

    public function icon(): ?string
    {
        return Wire::scalar($this->attribute()->icon);
    }

    public function category(): string
    {
        $category = $this->attribute()->category;

        return $category instanceof BlockCategory ? $category->value : $category;
    }

    public function description(): ?string
    {
        return $this->attribute()->description;
    }

    /**
     * @return list<string>
     */
    public function keywords(): array
    {
        return array_values($this->attribute()->keywords);
    }

    private function attribute(): AsBlock
    {
        return Attributes::get(static::class, AsBlock::class) ?? new AsBlock(static::class);
    }
}
