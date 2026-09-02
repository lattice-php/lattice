<?php
declare(strict_types=1);

namespace Lattice\Blocks;

use Illuminate\Support\Str;

/**
 * A named child-block list of a layout block, optionally restricted to a set
 * of block definitions and bounded in size.
 *
 * @api
 */
final class Slot
{
    /** @var list<class-string<BlockDefinition>> */
    private array $allows = [];

    private ?string $label = null;

    private ?int $min = null;

    private ?int $max = null;

    private function __construct(public readonly string $name) {}

    public static function make(string $name): self
    {
        return new self($name);
    }

    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    /**
     * @param  list<class-string<BlockDefinition>>  $blocks
     */
    public function allows(array $blocks): self
    {
        $this->allows = $blocks;

        return $this;
    }

    public function min(int $min): self
    {
        $this->min = $min;

        return $this;
    }

    public function max(int $max): self
    {
        $this->max = $max;

        return $this;
    }

    /**
     * @return list<class-string<BlockDefinition>>
     */
    public function allowedBlocks(): array
    {
        return $this->allows;
    }

    public function data(BlockRegistry $registry): SlotData
    {
        return new SlotData(
            name: $this->name,
            label: $this->label ?? Str::headline($this->name),
            allows: $this->allows === [] ? null : array_map($registry->keyOf(...), $this->allows),
            min: $this->min,
            max: $this->max,
        );
    }
}
