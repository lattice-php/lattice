<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use BackedEnum;
use Illuminate\Support\Str;
use Lattice\Core\Support\Wire;

/**
 * A ready-made group of blocks the library inserts in one go. The stored
 * nodes are templates: the editor mints fresh ids on every insertion, so the
 * same pattern can appear on a page more than once.
 *
 * @api
 */
final class BlockPattern
{
    private ?string $label = null;

    private ?string $description = null;

    private ?string $icon = null;

    /** @var list<BlockNode> */
    private array $blocks = [];

    private function __construct(public readonly string $key) {}

    public static function make(string $key): self
    {
        return new self($key);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function description(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function icon(BackedEnum|string $icon): self
    {
        $this->icon = Wire::scalar($icon);

        return $this;
    }

    /**
     * @param  list<BlockNode>  $blocks
     */
    public function blocks(array $blocks): self
    {
        $this->blocks = $blocks;

        return $this;
    }

    public function data(): BlockPatternData
    {
        return new BlockPatternData(
            key: $this->key,
            label: $this->label ?? Str::headline($this->key),
            description: $this->description,
            icon: $this->icon,
            blocks: $this->blocks,
        );
    }
}
