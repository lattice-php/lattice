<?php
declare(strict_types=1);

namespace Lattice\Lattice\Blocks;

/**
 * A named child-row list of a block, optionally restricted to a set of block
 * definitions. A plain string in {@see BlockDefinition::slots()} is shorthand
 * for an unrestricted slot.
 *
 * @api
 */
final class Slot
{
    /**
     * @var array<int, class-string<BlockDefinition>>
     */
    private array $blocks = [];

    private ?string $label = null;

    private function __construct(public readonly string $name) {}

    public static function make(string $name): self
    {
        return new self($name);
    }

    /**
     * The heading shown above the slot in the editor; defaults to the name.
     */
    public function label(string $label): self
    {
        $this->label = $label;

        return $this;
    }

    public function labelText(): ?string
    {
        return $this->label;
    }

    /**
     * Restrict the slot to the given block definitions.
     *
     * @param  array<int, class-string<BlockDefinition>>  $blocks
     */
    public function blocks(array $blocks): self
    {
        $this->blocks = array_values($blocks);

        return $this;
    }

    /**
     * The allowed block definitions, empty when the slot is unrestricted.
     *
     * @return array<int, class-string<BlockDefinition>>
     */
    public function allowedBlocks(): array
    {
        return $this->blocks;
    }
}
